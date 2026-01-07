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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let q;
    if (clientId) {
      q = query(
        collection(db, 'interactions'), 
        where('clientId', '==', clientId),
        orderBy('data', 'desc')
      );
    } else {
      q = query(collection(db, 'interactions'), orderBy('data', 'desc'));
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
          createdAt: docData.createdAt?.toDate() || new Date(),
        };
      });
      setInteractions(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, clientId]);

  const addInteraction = async (interactionData: Omit<Interaction, 'id' | 'createdAt' | 'corretorId'>) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    await addDoc(collection(db, 'interactions'), {
      ...interactionData,
      data: Timestamp.fromDate(new Date(interactionData.data)),
      corretorId: user.uid,
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
