import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyApplication } from '../api';
import { Loader, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StudentVerification() {
  const { applicationId, memberId, token } = useParams();
  const [status, setStatus] = useState('verifying'); // States: verifying | success | error
  const [message, setMessage] = useState('Verifying your application, please wait...');

  useEffect(() => {
    if (applicationId && memberId && token) {
      verifyApplication(applicationId, memberId, token)
        .then(res => {
          setStatus('success');
          setMessage(res.data.message);
        })
        .catch(err => {
          setStatus('error');
          setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or has expired.');
        });
    }
  }, [applicationId, memberId, token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        {status === 'verifying' && <Loader className="w-12 h-12 text-cyan-400 mx-auto animate-spin mb-4" />}
        {status === 'success' && <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />}
        {status === 'error' && <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />}
        
        <h1 className="text-2xl font-bold mb-2">Application Verification</h1>
        <p className="text-slate-300 mb-6">{message}</p>
        
        <Link to="/student-dashboard" className="inline-block bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-lg font-semibold transition">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}