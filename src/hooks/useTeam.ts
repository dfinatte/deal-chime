import { useState, useEffect, useRef } from 'react';
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
  getDocs
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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

    // Query simples sem orderBy para evitar necessidade de índice composto
    const q = query(
      collection(db, 'teamMembers'), 
      where('companyId', '==', companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: TeamMember[] = snapshot.docs.map((docSnap) => {
        const docData = docSnap.data();
        return {
          id: docSnap.id,
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
      
      // Ordenar no cliente
      data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setMembers(data);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar membros:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, isAdmin, companyId]);

  const addMember = async (memberData: { email: string; nome: string; role: UserRole; senha: string }, adminPassword: string) => {
    if (!user || !user.email || !isAdmin || !companyId) throw new Error('Não autorizado');
    
    // Salvar email do admin para re-autenticação
    const adminEmail = user.email;
    
    // Check if email already exists
    const q = query(collection(db, 'teamMembers'), where('email', '==', memberData.email));
    const existing = await getDocs(q);
    
    if (!existing.empty) {
      throw new Error('Este email já está cadastrado');
    }

    try {
      // Create Firebase Auth user (isso vai logar automaticamente o novo usuário)
      await createUserWithEmailAndPassword(auth, memberData.email, memberData.senha);
      
      // Add to teamMembers collection with companyId
      await addDoc(collection(db, 'teamMembers'), {
        email: memberData.email,
        nome: memberData.nome,
        role: memberData.role,
        ativo: true,
        companyId: companyId,
        createdAt: Timestamp.now(),
        trialStartDate: Timestamp.now(),
        subscriptionStatus: 'active',
      });

      // Re-autenticar o admin para voltar à sessão original
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    } catch (error) {
      // Se algo der errado, tentar re-autenticar o admin
      try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      } catch (reAuthError) {
        console.error('Erro ao re-autenticar admin:', reAuthError);
      }
      throw error;
    }
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
