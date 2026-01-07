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
  where,
  or
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notification } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, teamMember } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Busca notificações para este usuário ou para todos
    const q = query(
      collection(db, 'notifications'),
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
            lida: docData.lida,
            createdAt: docData.createdAt?.toDate() || new Date(),
          };
        })
        .filter(n => n.destinatarioId === 'all' || n.destinatarioId === user.uid);
      
      setNotifications(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const sendNotification = async (data: {
    titulo: string;
    mensagem: string;
    tipo: 'info' | 'warning' | 'success' | 'error';
    destinatarioId: string | 'all';
  }) => {
    if (!user || !teamMember) throw new Error('Não autorizado');

    await addDoc(collection(db, 'notifications'), {
      ...data,
      remetenteId: user.uid,
      remetenteNome: teamMember.nome,
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
