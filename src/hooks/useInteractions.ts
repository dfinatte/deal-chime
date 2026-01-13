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
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Interaction } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useInteractions = (clientId?: string) => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, companyId } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Queries simples sem orderBy para evitar necessidade de índice composto
    let q;
    if (clientId) {
      q = query(
        collection(db, 'interactions'), 
        where('clientId', '==', clientId)
      );
    } else if (companyId) {
      q = query(
        collection(db, 'interactions'), 
        where('companyId', '==', companyId)
      );
    } else {
      q = query(
        collection(db, 'interactions'), 
        where('corretorId', '==', user.uid)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Interaction[] = snapshot.docs.map((docSnap) => {
        const docData = docSnap.data();
        return {
          id: docSnap.id,
          clientId: docData.clientId,
          data: docData.data?.toDate() || new Date(),
          meio: docData.meio,
          resumo: docData.resumo,
          corretorId: docData.corretorId,
          companyId: docData.companyId,
          createdAt: docData.createdAt?.toDate() || new Date(),
        };
      });
      
      // Ordenar no cliente
      data.sort((a, b) => b.data.getTime() - a.data.getTime());
      
      setInteractions(data);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar interações:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, clientId, companyId]);

  const addInteraction = async (interactionData: Omit<Interaction, 'id' | 'createdAt' | 'corretorId' | 'companyId'>) => {
    if (!user) throw new Error('Usuário não autenticado');
    if (!companyId) throw new Error('Usuário não vinculado a uma empresa');
    
    await addDoc(collection(db, 'interactions'), {
      ...interactionData,
      data: Timestamp.fromDate(new Date(interactionData.data)),
      corretorId: user.uid,
      companyId: companyId,
      createdAt: Timestamp.now(),
    });

    // Update client's last update
    await updateDoc(doc(db, 'clients', interactionData.clientId), {
      ultimaAtualizacao: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  };

  const deleteInteraction = async (id: string) => {
    await deleteDoc(doc(db, 'interactions', id));
  };

  return { interactions, loading, addInteraction, deleteInteraction };
};
