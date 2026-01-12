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
  const { user, isAdmin, companyId } = useAuth();

  useEffect(() => {
    if (!user || !isAdmin || !companyId) {
      setLoading(false);
      return;
    }

    // Filtrar membros da equipe pela empresa
    const q = query(
      collection(db, 'teamMembers'), 
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: TeamMember[] = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          email: docData.email,
          nome: docData.nome,
          role: docData.role,
          ativo: docData.ativo,
          companyId: docData.companyId,
          createdAt: docData.createdAt?.toDate() || new Date(),
          trialStartDate: docData.trialStartDate?.toDate(),
          subscriptionStatus: docData.subscriptionStatus,
        };
      });
      setMembers(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, isAdmin, companyId]);

  const addMember = async (memberData: { email: string; nome: string; role: UserRole; senha: string }) => {
    if (!user || !isAdmin || !companyId) throw new Error('Não autorizado');
    
    // Check if email already exists
    const q = query(collection(db, 'teamMembers'), where('email', '==', memberData.email));
    const existing = await getDocs(q);
    
    if (!existing.empty) {
      throw new Error('Este email já está cadastrado');
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, memberData.email, memberData.senha);
    
    // Add to teamMembers collection with companyId
    await addDoc(collection(db, 'teamMembers'), {
      email: memberData.email,
      nome: memberData.nome,
      role: memberData.role,
      ativo: true,
      companyId: companyId,
      createdAt: Timestamp.now(),
      trialStartDate: Timestamp.now(),
      subscriptionStatus: 'active', // Membros herdam status da empresa
    });
  };

  const updateMember = async (id: string, memberData: Partial<TeamMember>) => {
    if (!user || !isAdmin) throw new Error('Não autorizado');
    
    const docRef = doc(db, 'teamMembers', id);
    // Não permitir alterar companyId
    const { companyId: _, ...safeData } = memberData;
    await updateDoc(docRef, safeData);
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
