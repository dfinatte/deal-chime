import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { TeamMember, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  teamMember: TeamMember | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  companyId: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INITIAL_ADMIN_EMAIL = 'davimendesfinatte@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = teamMember?.role === 'admin';
  const companyId = teamMember?.companyId || (isAdmin ? user?.uid : null) || null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
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
            companyId: data.companyId,
          });
        } else {
          if (firebaseUser.email === INITIAL_ADMIN_EMAIL) {
            const newMember: Omit<TeamMember, 'id'> = {
              email: firebaseUser.email,
              nome: 'Administrador',
              role: 'admin',
              ativo: true,
              createdAt: new Date(),
              // Importante: para o admin inicial, a própria conta é a “empresa”
              // (isso evita permission-denied nas coleções que validam companyId)
              companyId: firebaseUser.uid,
            };
            await setDoc(doc(db, 'teamMembers', firebaseUser.uid), newMember);
            setTeamMember({ id: firebaseUser.uid, ...newMember });
          } else {
            // Se o usuário existe no Auth mas não tem perfil em teamMembers/{uid},
            // ele não está autorizado (ou o registro não criou o documento corretamente).
            await firebaseSignOut(auth);
            setTeamMember(null);
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
    // Nunca consulte o Firestore antes do login: as regras exigem request.auth.
    // A autorização é validada depois no onAuthStateChanged (verificação do teamMembers/{uid}).
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setTeamMember(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      teamMember, 
      loading, 
      signIn, 
      signOut, 
      isAdmin,
      companyId
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
