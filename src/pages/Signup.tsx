/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserPlus, Phone } from 'lucide-react';

export default function Signup() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (phone.length < 10) {
      setError('Please enter a valid Indian phone number');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // Save additional data to Firestore
      const isUserEmailAdmin = email === 'rajnibhadoriya324@gmail.com';
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: name,
        email: email,
        phoneNumber: phone,
        isAdmin: isUserEmailAdmin,
        createdAt: new Date().toISOString()
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-6">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
          <UserPlus className="text-cyan-400 w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Elite Membership</h2>
        <p className="text-slate-500 text-sm mt-2">Join the inner circle of Indian market traders.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
        <CardHeader className="pt-8 pb-4">
          <CardTitle className="text-center text-white text-lg">Create Your Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Full Name</Label>
              <Input 
                placeholder="Rahul Sharma" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-black/20 border-white/10 text-white h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Email Address</Label>
              <Input 
                type="email"
                placeholder="name@example.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-black/20 border-white/10 text-white h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Phone Number (+91)</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  placeholder="9876543210" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="bg-black/20 border-white/10 text-white h-12 pl-12"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Secure Password</Label>
              <Input 
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-black/20 border-white/10 text-white h-12"
                required
              />
            </div>

            {error && <p className="text-rose-400 text-xs text-center font-bold">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 h-12 font-black tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-500/20">
              {loading ? 'PROCESSING...' : 'INITIALIZE ACCOUNT'}
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-slate-600 font-bold">OR</span></div>
          </div>

          <Button onClick={login} variant="outline" className="w-full border-white/10 text-white h-12 hover:bg-white/5 rounded-xl font-bold">
            <ShieldCheck className="mr-2 w-5 h-5 text-cyan-400" />
            ONE-CLICK GOOGLE LOGIN
          </Button>
        </CardContent>
      </div>
    </div>
  );
}
