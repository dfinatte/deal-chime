import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  orderBy,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Client } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, companyId } = useAuth();

  useEffect(() => {
    if (!user) return;

    let q;
    if (isAdmin && companyId) {
      // Admin vê todos os clientes da empresa
      q = query(
        collection(db, 'clients'), 
        where('companyId', '==', companyId),
        orderBy('createdAt', 'desc')
      );
    } else if (companyId) {
      // Corretor vê apenas seus próprios clientes
      q = query(
        collection(db, 'clients'), 
        where('companyId', '==', companyId),
        where('corretorId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Fallback: usuário sem empresa vê apenas seus próprios clientes
      q = query(
        collection(db, 'clients'), 
        where('corretorId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData: Client[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nome: data.nome,
          telefone: data.telefone,
          dataCadastro: data.dataCadastro?.toDate() || new Date(),
          dataChegada: data.dataChegada?.toDate() || new Date(),
          canal: data.canal,
          perfilBusca: data.perfilBusca,
          budget: data.budget,
          observacoes: data.observacoes,
          temperatura: data.temperatura,
          statusJornada: data.statusJornada,
          ultimaAtualizacao: data.ultimaAtualizacao?.toDate() || new Date(),
          qtdeVisitas: data.qtdeVisitas || 0,
          corretorId: data.corretorId,
          companyId: data.companyId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
      setClients(clientsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, isAdmin, companyId]);

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'ultimaAtualizacao' | 'qtdeVisitas' | 'companyId'>) => {
    if (!user) throw new Error('Usuário não autenticado');
    if (!companyId) throw new Error('Usuário não vinculado a uma empresa');
    
    const now = Timestamp.now();
    await addDoc(collection(db, 'clients'), {
      ...clientData,
      dataCadastro: Timestamp.fromDate(new Date(clientData.dataCadastro)),
      dataChegada: Timestamp.fromDate(new Date(clientData.dataChegada)),
      corretorId: user.uid,
      companyId: companyId,
      qtdeVisitas: 0,
      ultimaAtualizacao: now,
      createdAt: now,
      updatedAt: now,
    });
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    const docRef = doc(db, 'clients', id);
    const updateData: Record<string, unknown> = { ...clientData, updatedAt: Timestamp.now() };
    
    // Não permitir alterar companyId
    delete updateData.companyId;
    
    if (clientData.dataCadastro) {
      updateData.dataCadastro = Timestamp.fromDate(new Date(clientData.dataCadastro));
    }
    if (clientData.dataChegada) {
      updateData.dataChegada = Timestamp.fromDate(new Date(clientData.dataChegada));
    }
    
    // Converter datas dos dados de venda
    if (clientData.dadosVenda) {
      updateData.dadosVenda = {
        ...clientData.dadosVenda,
        dataVenda: Timestamp.fromDate(new Date(clientData.dadosVenda.dataVenda)),
        dataPrevRecebimento: clientData.dadosVenda.dataPrevRecebimento 
          ? Timestamp.fromDate(new Date(clientData.dadosVenda.dataPrevRecebimento))
          : null,
        dataRecebimento: clientData.dadosVenda.dataRecebimento 
          ? Timestamp.fromDate(new Date(clientData.dadosVenda.dataRecebimento))
          : null,
      };
    }
    
    await updateDoc(docRef, updateData);
  };

  const deleteClient = async (id: string) => {
    await deleteDoc(doc(db, 'clients', id));
  };

  return { clients, loading, addClient, updateClient, deleteClient };
};
