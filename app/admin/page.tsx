'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavBar from '../components/NavBar';
import AdminMetrics from '../components/AdminMetrics';

interface UserType {
  id: string;
  username: string;
}

interface TeamType {
  id: string;
  name: string;
  members: UserType[];
}

interface TeamMetrics {
  efficiency: number;
  countDay: number;
  countWeek: number;
  countMonth: number;
}

export default function AdminDashboard() {
  // Unconditionally call hooks
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect non-admin users.
  useEffect(() => {
    if (
      status === 'unauthenticated' ||
      (session && session.user.role !== 'ADMIN')
    ) {
      router.push('/login');
    }
  }, [status, session, router]);

  // Team creation and management state
  const [teamName, setTeamName] = useState('');
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [, setSearchQuery] = useState('');
  const [, setSearchResults] = useState<UserType[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics | null>(null);

  // Loading state for team actions and user actions
  const [teamSearch, setTeamSearch] = useState<{
    [key: string]: { query: string; results: UserType[] };
  }>({});
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Fetch teams

  // ---------- Team Endpoints Functions ----------
  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      const data = await res.json();
      setTeams(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const createTeam = async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, creating: true }));
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName }),
      });
      if (!res.ok) throw new Error('Failed to create team');
      await res.json();
      setTeamName('');
      fetchTeams();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, creating: false }));
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [teamId]: true }));
      const res = await fetch(`/api/teams/${teamId}/deleteTeam`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Delete team failed:', data.error);
        throw new Error(data.error || 'Failed to delete team');
      }
      fetchTeams();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [teamId]: false }));
    }
  };

  // Search for users per team
  const searchUsersForTeam = async (teamId: string) => {
    setLoadingStates((prev) => ({ ...prev, [`searching-${teamId}`]: true }));
    try {
      const query = teamSearch[teamId]?.query || '';
      const res = await fetch(`/api/users?search=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to search users');
      const data = await res.json();
      setTeamSearch((prev) => ({
        ...prev,
        [teamId]: { ...prev[teamId], results: data },
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`searching-${teamId}`]: false }));
    }
  };

  const addUserToTeam = async (userId: string, teamId: string) => {
    try {
      if (session?.user.username === 'demoadmin') {
        alert('Demo Admin cannot add users to a team.');
        return;
      }

      setLoadingStates((prev) => ({ ...prev, [`adding-${teamId}`]: true }));
      const res = await fetch(`/api/teams/${teamId}/addUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Failed to add user to team');
      await res.json();
      // Clear the search query and results after adding a user
      setSearchQuery('');
      setSearchResults([]);
      fetchTeams();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`adding-${teamId}`]: false }));
    }
  };

  const removeUserFromTeam = async (userId: string, teamId: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [`removing-${teamId}`]: true }));
      const res = await fetch(`/api/teams/${teamId}/removeUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Failed to remove user from team');
      await res.json();
      fetchTeams();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`removing-${teamId}`]: false }));
    }
  };

  // ---------- Team Metrics ----------
  const fetchTeamMetrics = async (teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/metrics`);
      if (!res.ok) throw new Error('Failed to fetch team metrics');
      const data = await res.json();
      setTeamMetrics(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (teams.length > 0) {
      // For simplicity, fetch metrics for the first team
      fetchTeamMetrics(teams[0].id);
    }
  }, [teams]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-primaryText p-6'>
      <NavBar />
      <h1 className='text-4xl font-bold mb-8 text-center'>Admin Dashboard</h1>

      {/* Responsive Grid Layout */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto'>
        {/* Team Creation Section */}
        <div className='bg-black/40 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-700'>
          <h2 className='text-2xl font-bold mb-4 text-center'>
            Create a New Team
          </h2>
          <div className='flex space-x-2'>
            <input
              type='text'
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder='Team Name'
              className='flex-grow p-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent'
            />
            <button
              onClick={createTeam}
              disabled={loadingStates.creating}
              className='px-5 py-2 bg-accent text-black font-semibold rounded-lg transition hover:bg-accentLight disabled:opacity-50'
            >
              {loadingStates.creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>

        {/* Team Metrics Section */}
        <div className='bg-black/40 backdrop-blur-md p-6 rounded-xl shadow-lg border mt-4 border-gray-700'>
          <h2 className='text-2xl font-bold mb-4 text-center'>Team Metrics</h2>
          {teamMetrics ? (
            <AdminMetrics metrics={teamMetrics} />
          ) : (
            <p className='text-secondaryText text-center'>
              No metrics available for your team.
            </p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 mt-8 md:grid-cols-3 gap-6'>
        {teams.map((team) => (
          <div
            key={team.id}
            className='bg-black/40 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-700 
        transition hover:scale-105 hover:shadow-xl flex flex-col justify-between min-w-0'
          >
            {/* Team Name & Delete Button */}
            <div className='flex justify-between items-center mb-3'>
              <h3 className='text-xl font-semibold truncate w-full'>
                {team.name}
              </h3>
              <button
                onClick={() => deleteTeam(team.id)}
                disabled={loadingStates[team.id]}
                className='text-orangeAccent text-sm font-semibold underline transition hover:text-red-500 disabled:opacity-50'
              >
                {loadingStates[team.id] ? 'Removing...' : 'Remove Team'}
              </button>
            </div>

            {/* Team Members List */}
            <p className='text-sm text-secondaryText mb-2'>Team Members:</p>
            {team.members && team.members.length > 0 ? (
              <ul className='space-y-2'>
                {team.members.map((member) => (
                  <li
                    key={member.id}
                    className='flex justify-between items-center flex-wrap'
                  >
                    <span className='truncate w-2/3'>{member.username}</span>
                    <button
                      onClick={() => removeUserFromTeam(member.id, team.id)}
                      disabled={loadingStates[member.id]}
                      className='text-orangeAccent text-sm font-semibold underline transition hover:text-red-500 disabled:opacity-50'
                    >
                      {loadingStates[member.id] ? 'Removing...' : 'Remove'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-sm text-secondaryText'>No team members yet.</p>
            )}

            {/* User Search */}
            <div className='flex flex-col space-y-2 mt-4'>
              <input
                type='text'
                value={teamSearch[team.id]?.query || ''}
                onChange={(e) =>
                  setTeamSearch((prev) => ({
                    ...prev,
                    [team.id]: { ...prev[team.id], query: e.target.value },
                  }))
                }
                placeholder='Search users'
                className='w-full p-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent'
              />
              <button
                onClick={() => searchUsersForTeam(team.id)}
                disabled={loadingStates[`searching-${team.id}`]}
                className='w-full py-2 bg-accent text-black font-semibold rounded-lg transition hover:bg-accentLight disabled:opacity-50'
              >
                {loadingStates[`searching-${team.id}`]
                  ? 'Searching...'
                  : 'Search'}
              </button>
            </div>

            {/* Search Results */}
            {teamSearch[team.id]?.results?.length > 0 && (
              <ul className='mt-4 space-y-2'>
                {teamSearch[team.id].results.map((user) => (
                  <li
                    key={user.id}
                    className='flex justify-between items-center flex-wrap'
                  >
                    <span className='truncate w-2/3'>{user.username}</span>
                    <button
                      onClick={() => addUserToTeam(user.id, team.id)}
                      disabled={loadingStates[`adding-${team.id}`]}
                      className='text-tealAccent text-sm font-semibold underline transition hover:text-green-400 disabled:opacity-50'
                    >
                      {loadingStates[`adding-${team.id}`] ? 'Adding...' : 'Add'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
