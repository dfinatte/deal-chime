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
  where,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Visit } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useVisits = (clientId?: string) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let q;
    if (clientId) {
      q = query(
        collection(db, 'visits'), 
        where('clientId', '==', clientId),
        orderBy('data', 'desc')
      );
    } else {
      q = query(collection(db, 'visits'), orderBy('data', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Visit[] = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          clientId: docData.clientId,
          data: docData.data?.toDate() || new Date(),
          codigoImovel: docData.codigoImovel,
          enderecoImovel: docData.enderecoImovel,
          feedback: docData.feedback,
          corretorId: docData.corretorId,
          createdAt: docData.createdAt?.toDate() || new Date(),
        };
      });
      setVisits(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, clientId]);

  const addVisit = async (visitData: Omit<Visit, 'id' | 'createdAt' | 'corretorId'>) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    await addDoc(collection(db, 'visits'), {
      ...visitData,
      data: Timestamp.fromDate(new Date(visitData.data)),
      corretorId: user.uid,
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
