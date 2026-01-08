import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { TeamMember, UserRole, SubscriptionStatus } from '@/types';

interface AuthContextType {
  user: User | null;
  teamMember: (TeamMember & { companyId?: string }) | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  isTrialExpired: boolean;
  daysLeftInTrial: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INITIAL_ADMIN_EMAIL = 'davimendesfinatte@gmail.com';
const TRIAL_DAYS = 14;

const calculateDaysLeft = (trialStartDate: Date): number => {
  const now = new Date();
  const trialEnd = new Date(trialStartDate);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [teamMember, setTeamMember] = useState<(TeamMember & { companyId?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [daysLeftInTrial, setDaysLeftInTrial] = useState(TRIAL_DAYS);

  const isAdmin = teamMember?.role === 'admin';
  const isTrialExpired = subscriptionStatus === 'trial' && daysLeftInTrial <= 0;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const memberDoc = await getDoc(doc(db, 'teamMembers', firebaseUser.uid));
        
        if (memberDoc.exists()) {
          const data = memberDoc.data();
          const trialStart = data.trialStartDate?.toDate() || data.createdAt?.toDate() || new Date();
          const status = data.subscriptionStatus || 'trial';
          const daysLeft = calculateDaysLeft(trialStart);
          
          setTeamMember({
            id: memberDoc.id,
            email: data.email,
            nome: data.nome,
            role: data.role,
            ativo: data.ativo,
            createdAt: data.createdAt?.toDate() || new Date(),
            trialStartDate: trialStart,
            subscriptionStatus: status,
            companyId: data.companyId,
          });
          setSubscriptionStatus(status);
          setDaysLeftInTrial(daysLeft);
        } else {
          if (firebaseUser.email === INITIAL_ADMIN_EMAIL) {
            const newMember: Omit<TeamMember, 'id'> = {
              email: firebaseUser.email,
              nome: 'Administrador',
              role: 'admin',
              ativo: true,
              createdAt: new Date(),
              trialStartDate: new Date(),
              subscriptionStatus: 'active', // Admin sempre ativo
            };
            await setDoc(doc(db, 'teamMembers', firebaseUser.uid), newMember);
            setTeamMember({ id: firebaseUser.uid, ...newMember });
            setSubscriptionStatus('active');
            setDaysLeftInTrial(TRIAL_DAYS);
          } else {
            const q = query(collection(db, 'teamMembers'), where('email', '==', firebaseUser.email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const memberData = querySnapshot.docs[0].data();
              const trialStart = memberData.trialStartDate?.toDate() || memberData.createdAt?.toDate() || new Date();
              const status = memberData.subscriptionStatus || 'trial';
              const daysLeft = calculateDaysLeft(trialStart);
              
              setTeamMember({
                id: querySnapshot.docs[0].id,
                email: memberData.email,
                nome: memberData.nome,
                role: memberData.role,
                ativo: memberData.ativo,
                createdAt: memberData.createdAt?.toDate() || new Date(),
                trialStartDate: trialStart,
                subscriptionStatus: status,
                companyId: memberData.companyId,
              });
              setSubscriptionStatus(status);
              setDaysLeftInTrial(daysLeft);
            } else {
              await firebaseSignOut(auth);
              setTeamMember(null);
              setSubscriptionStatus(null);
            }
          }
        }
      } else {
        setTeamMember(null);
        setSubscriptionStatus(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const isInitialAdmin = email === INITIAL_ADMIN_EMAIL;
    
    if (!isInitialAdmin) {
      const q = query(collection(db, 'teamMembers'), where('email', '==', email), where('ativo', '==', true));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Email não autorizado. Entre em contato com o administrador.');
      }
    }
    
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setTeamMember(null);
    setSubscriptionStatus(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      teamMember, 
      loading, 
      signIn, 
      signOut, 
      isAdmin,
      subscriptionStatus,
      isTrialExpired,
      daysLeftInTrial
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
