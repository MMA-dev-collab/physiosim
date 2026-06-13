import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import MedicalLoader from '@/components/ui/MedicalLoader';
import { motion } from 'framer-motion';
import { Trophy, Medal, User, Award, Hash, BookOpen } from 'lucide-react';

export default function LeaderboardPage({ auth }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/leaderboard`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'ngrok-skip-browser-warning': 'true'
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data);
        const userRank = data.find((entry) => entry.userId === auth.user.id);
        setCurrentUserRank(userRank);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [auth]);

  if (loading) return (
    <MedicalLoader />
  );

  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  // Reorder for podium display: [2nd, 1st, 3rd]
  const podiumLayout = [];
  if (topThree[1]) podiumLayout.push(topThree[1]);
  if (topThree[0]) podiumLayout.push(topThree[0]);
  if (topThree[2]) podiumLayout.push(topThree[2]);

  return (
    <div className="page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold tracking-wide uppercase"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Global Leaderboard
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black tracking-tight text-slate-900"
        >
          Top Performers
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto text-slate-500 text-lg"
        >
          Recognizing excellence in clinical simulation. See how you compare with our global community.
        </motion.p>
      </div>

      {/* Podium Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-12 md:gap-4 lg:gap-8 py-12 px-4 bg-slate-50/50 rounded-3xl border border-slate-100">
        {podiumLayout.map((user, index) => {
          const isFirst = user.rank === 1;
          const isSecond = user.rank === 2;
          const isThird = user.rank === 3;
          
          return (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`relative flex flex-col items-center group w-full max-w-[280px] 
                ${isFirst ? 'order-1 md:order-2 z-10' : isSecond ? 'order-2 md:order-1' : 'order-3 md:order-3'}`}
            >
              <div className={`relative mb-6 ${isFirst ? 'scale-110' : 'scale-95'}`}>
                {/* Profile Image/Avatar */}
                <div className={`w-24 h-24 rounded-2xl overflow-hidden border-4 bg-white shadow-xl transition-transform group-hover:scale-105 ${isFirst ? 'border-yellow-400' : isSecond ? 'border-slate-300' : 'border-amber-600'}`}>
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>
                
                {/* Rank Badge */}
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full shadow-lg ${isFirst ? 'bg-yellow-400 text-yellow-950' : isSecond ? 'bg-slate-300 text-slate-800' : 'bg-amber-600 text-white'}`}>
                  {isFirst ? <Trophy className="w-6 h-6" /> : isSecond ? <Award className="w-6 h-6" /> : <Medal className="w-6 h-6" />}
                </div>
              </div>

              {/* User Info */}
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-slate-900 truncate max-w-full">
                  {user.name || "Student"}
                  {user.userId === auth.user.id && <span className="ml-2 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">YOU</span>}
                </h3>
              </div>

              {/* Stats & Podium Base */}
              <div className={`mt-6 w-full rounded-2xl bg-white p-5 border shadow-sm transition-all group-hover:shadow-md ${
                isFirst 
                  ? 'border-yellow-100 bg-gradient-to-b from-yellow-50 to-white min-h-[220px] shadow-lg -translate-y-4' 
                  : isSecond 
                    ? 'border-slate-100 min-h-[180px] -translate-y-2' 
                    : 'border-slate-100 min-h-[150px]'
              }`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Cases</span>
                    <span className="text-slate-900 font-bold">{user.casesCompleted}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-50 flex flex-col items-center">
                    <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px] mb-1">Total Score</span>
                    <span className={`text-2xl font-black ${isFirst ? 'text-yellow-600' : 'text-slate-900'}`}>{user.totalScore.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-widest">Points</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* List Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">Top Rankings</h2>
          <div className="text-sm text-slate-500 font-medium">
             Total Participants: <span className="text-slate-900 font-bold">{leaderboard.length}</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Rank</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest leading-none">User</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest leading-none text-center">Cases</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest leading-none text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {others.map((user, index) => (
                <motion.tr 
                  key={user.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className={`group hover:bg-slate-50/80 transition-colors ${user.userId === auth.user.id ? 'bg-blue-50/40 ring-1 ring-inset ring-blue-100' : ''}`}
                >
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold w-7 text-center ${user.rank <= 5 ? 'text-blue-600' : 'text-slate-400'}`}>
                        #{user.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {user.name || "Student"}
                          {user.userId === auth.user.id && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md">YOU</span>}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">{user.casesCompleted}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-slate-900">{user.totalScore.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Points</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {others.length === 0 && leaderboard.length <= 3 && (
            <div className="py-20 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 mb-2">
                <Hash className="w-6 h-6" />
              </div>
              <p className="text-slate-400 font-medium">No more rankings available yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Current User Floating Status (if not in top 100) */}
      {currentUserRank && currentUserRank.rank > 100 && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50"
        >
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">
                #{currentUserRank.rank}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Your Position</p>
                <p className="text-sm font-bold">{auth.user.name || "Student"}</p>
              </div>
            </div>
            <div className="flex items-center gap-8 px-4 border-l border-white/10">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cases</p>
                <p className="text-sm font-bold">{currentUserRank.casesCompleted}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Score</p>
                <p className="text-sm font-black text-blue-400">{currentUserRank.totalScore.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}



