/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, LogIn, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-6">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
          <Lock className="text-cyan-400 w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Access Terminal</h2>
        <p className="text-slate-500 text-sm mt-2">Secure entry to Bharat Trade Network.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
        <CardHeader className="pt-8 pb-4">
          <CardTitle className="text-center text-white text-lg">Identity Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
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
              <Label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Password</Label>
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
              {loading ? 'VERIFYING...' : 'AUTHORIZE'}
              {!loading && <LogIn className="ml-2 w-4 h-4" />}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Don't have access? <Link to="/signup" className="text-cyan-400 hover:underline font-bold">Request Membership</Link>
            </p>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-slate-600 font-bold">OR</span></div>
          </div>

          <Button onClick={login} variant="outline" className="w-full border-white/10 text-white h-12 hover:bg-white/5 rounded-xl font-bold">
            <ShieldCheck className="mr-2 w-5 h-5 text-cyan-400" />
            ONE-CLICK GOOGLE SSO
          </Button>
        </CardContent>
      </div>
    </div>
  );
}
