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
  getDocs
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { TeamMember, UserRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'teamMembers'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: TeamMember[] = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          email: docData.email,
          nome: docData.nome,
          role: docData.role,
          ativo: docData.ativo,
          createdAt: docData.createdAt?.toDate() || new Date(),
        };
      });
      setMembers(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, isAdmin]);

  const addMember = async (memberData: { email: string; nome: string; role: UserRole; senha: string }) => {
    if (!user || !isAdmin) throw new Error('Não autorizado');
    
    // Check if email already exists
    const q = query(collection(db, 'teamMembers'), where('email', '==', memberData.email));
    const existing = await getDocs(q);
    
    if (!existing.empty) {
      throw new Error('Este email já está cadastrado');
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, memberData.email, memberData.senha);
    
    // Add to teamMembers collection
    await addDoc(collection(db, 'teamMembers'), {
      email: memberData.email,
      nome: memberData.nome,
      role: memberData.role,
      ativo: true,
      createdAt: Timestamp.now(),
    });
  };

  const updateMember = async (id: string, memberData: Partial<TeamMember>) => {
    if (!user || !isAdmin) throw new Error('Não autorizado');
    
    const docRef = doc(db, 'teamMembers', id);
    await updateDoc(docRef, memberData);
  };

  const toggleMemberStatus = async (id: string, ativo: boolean) => {
    if (!user || !isAdmin) throw new Error('Não autorizado');
    
    const docRef = doc(db, 'teamMembers', id);
    await updateDoc(docRef, { ativo });
  };

  const deleteMember = async (id: string) => {
    if (!user || !isAdmin) throw new Error('Não autorizado');
    
    await deleteDoc(doc(db, 'teamMembers', id));
  };

  return { members, loading, addMember, updateMember, toggleMemberStatus, deleteMember };
};
