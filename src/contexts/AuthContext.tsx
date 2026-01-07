import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { TeamMember, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  teamMember: TeamMember | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Authorized emails with their roles
const INITIAL_ADMIN_EMAIL = 'davimendesfinatte@gmail.com';
const DEFAULT_PASSWORD = 'Imob@2024!';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = teamMember?.role === 'admin';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Check if user is in team members
        const memberDoc = await getDoc(doc(db, 'teamMembers', firebaseUser.uid));
        
        if (memberDoc.exists()) {
          const data = memberDoc.data();
          setTeamMember({
            id: memberDoc.id,
            email: data.email,
            nome: data.nome,
            role: data.role,
            ativo: data.ativo,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        } else {
          // Check if it's the initial admin
          if (firebaseUser.email === INITIAL_ADMIN_EMAIL) {
            const newMember: Omit<TeamMember, 'id'> = {
              email: firebaseUser.email,
              nome: 'Administrador',
              role: 'admin',
              ativo: true,
              createdAt: new Date(),
            };
            await setDoc(doc(db, 'teamMembers', firebaseUser.uid), newMember);
            setTeamMember({ id: firebaseUser.uid, ...newMember });
          } else {
            // Check by email in teamMembers
            const q = query(collection(db, 'teamMembers'), where('email', '==', firebaseUser.email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const memberData = querySnapshot.docs[0].data();
              setTeamMember({
                id: querySnapshot.docs[0].id,
                email: memberData.email,
                nome: memberData.nome,
                role: memberData.role,
                ativo: memberData.ativo,
                createdAt: memberData.createdAt?.toDate() || new Date(),
              });
            } else {
              // User not authorized
              await firebaseSignOut(auth);
              setTeamMember(null);
            }
          }
        }
      } else {
        setTeamMember(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const isInitialAdmin = email === INITIAL_ADMIN_EMAIL;
    
    // Para o admin inicial, permite login direto sem verificar Firestore
    if (!isInitialAdmin) {
      const q = query(collection(db, 'teamMembers'), where('email', '==', email), where('ativo', '==', true));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Email não autorizado. Entre em contato com o administrador.');
      }
    }
    
    // Tenta autenticar com Firebase
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setTeamMember(null);
  };

  return (
    <AuthContext.Provider value={{ user, teamMember, loading, signIn, signOut, isAdmin }}>
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
