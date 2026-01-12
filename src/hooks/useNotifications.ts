import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc,
  orderBy,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notification } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, teamMember, companyId } = useAuth();

  useEffect(() => {
    if (!user || !companyId) {
      setLoading(false);
      return;
    }

    // Busca notificações da empresa
    const q = query(
      collection(db, 'notifications'),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Notification[] = snapshot.docs
        .map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            titulo: docData.titulo,
            mensagem: docData.mensagem,
            tipo: docData.tipo,
            destinatarioId: docData.destinatarioId,
            remetenteId: docData.remetenteId,
            remetenteNome: docData.remetenteNome,
            companyId: docData.companyId,
            lida: docData.lida,
            createdAt: docData.createdAt?.toDate() || new Date(),
          };
        })
        // Filtrar: notificações para todos ou para este usuário específico
        .filter(n => n.destinatarioId === 'all' || n.destinatarioId === user.uid);
      
      setNotifications(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, companyId]);

  const sendNotification = async (data: {
    titulo: string;
    mensagem: string;
    tipo: 'info' | 'warning' | 'success' | 'error';
    destinatarioId: string | 'all';
  }) => {
    if (!user || !teamMember || !companyId) throw new Error('Não autorizado');

    await addDoc(collection(db, 'notifications'), {
      ...data,
      remetenteId: user.uid,
      remetenteNome: teamMember.nome,
      companyId: companyId,
      lida: false,
      createdAt: Timestamp.now(),
    });
  };

  const markAsRead = async (id: string) => {
    const docRef = doc(db, 'notifications', id);
    await updateDoc(docRef, { lida: true });
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.lida);
    await Promise.all(
      unreadNotifications.map(n => 
        updateDoc(doc(db, 'notifications', n.id), { lida: true })
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.lida).length;

  return { notifications, loading, sendNotification, markAsRead, markAllAsRead, unreadCount };
};
