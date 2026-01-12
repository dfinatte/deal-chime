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
import { Interaction } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useInteractions = (clientId?: string) => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, companyId } = useAuth();

  useEffect(() => {
    if (!user) return;

    let q;
    if (clientId) {
      // Filtrar por cliente específico
      q = query(
        collection(db, 'interactions'), 
        where('clientId', '==', clientId),
        orderBy('data', 'desc')
      );
    } else if (companyId) {
      // Filtrar por empresa
      q = query(
        collection(db, 'interactions'), 
        where('companyId', '==', companyId),
        orderBy('data', 'desc')
      );
    } else {
      // Fallback: apenas interações do próprio usuário
      q = query(
        collection(db, 'interactions'), 
        where('corretorId', '==', user.uid),
        orderBy('data', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Interaction[] = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          clientId: docData.clientId,
          data: docData.data?.toDate() || new Date(),
          meio: docData.meio,
          resumo: docData.resumo,
          corretorId: docData.corretorId,
          companyId: docData.companyId,
          createdAt: docData.createdAt?.toDate() || new Date(),
        };
      });
      setInteractions(data);
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
