import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  Timestamp,
  where,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Visit } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useVisits = (clientId?: string) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, companyId } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Queries simples sem orderBy para evitar necessidade de índice composto
    let q;
    if (clientId) {
      q = query(
        collection(db, 'visits'), 
        where('clientId', '==', clientId)
      );
    } else if (companyId) {
      q = query(
        collection(db, 'visits'), 
        where('companyId', '==', companyId)
      );
    } else {
      q = query(
        collection(db, 'visits'), 
        where('corretorId', '==', user.uid)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Visit[] = snapshot.docs.map((docSnap) => {
        const docData = docSnap.data();
        return {
          id: docSnap.id,
          clientId: docData.clientId,
          data: docData.data?.toDate() || new Date(),
          codigoImovel: docData.codigoImovel,
          enderecoImovel: docData.enderecoImovel,
          feedback: docData.feedback,
          corretorId: docData.corretorId,
          companyId: docData.companyId,
          createdAt: docData.createdAt?.toDate() || new Date(),
        };
      });
      
      // Ordenar no cliente
      data.sort((a, b) => b.data.getTime() - a.data.getTime());
      
      setVisits(data);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar visitas:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, clientId, companyId]);

  const addVisit = async (visitData: Omit<Visit, 'id' | 'createdAt' | 'corretorId' | 'companyId'>) => {
    if (!user) throw new Error('Usuário não autenticado');
    if (!companyId) throw new Error('Usuário não vinculado a uma empresa');
    
    await addDoc(collection(db, 'visits'), {
      ...visitData,
      data: Timestamp.fromDate(new Date(visitData.data)),
      corretorId: user.uid,
      companyId: companyId,
      createdAt: Timestamp.now(),
    });

    // Increment visit count and update last update
    await updateDoc(doc(db, 'clients', visitData.clientId), {
      qtdeVisitas: increment(1),
      ultimaAtualizacao: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  };

  const deleteVisit = async (id: string, clientId: string) => {
    await deleteDoc(doc(db, 'visits', id));
    
    // Decrement visit count
    await updateDoc(doc(db, 'clients', clientId), {
      qtdeVisitas: increment(-1),
      updatedAt: Timestamp.now(),
    });
  };

  return { visits, loading, addVisit, deleteVisit };
};
