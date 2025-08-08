import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Couple {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  couple_id?: string;
  created_at: string;
}

export interface CoupleInvite {
  id: string;
  couple_id: string;
  invited_email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  couple?: Couple;
  inviter?: Profile;
}

export function useCouples() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [coupleMembers, setCoupleMembers] = useState<Profile[]>([]);
  const [pendingInvites, setPendingInvites] = useState<CoupleInvite[]>([]);
  const [sentInvites, setSentInvites] = useState<CoupleInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Criar perfil se não existir
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
            avatar_url: user.user_metadata?.avatar_url
          }])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchCouple = async () => {
    if (!profile?.couple_id) {
      setCouple(null);
      setCoupleMembers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('id', profile.couple_id)
        .single();

      if (error) throw error;
      setCouple(data);

      // Buscar membros do casal
      const { data: members, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('couple_id', profile.couple_id);

      if (membersError) throw membersError;
      setCoupleMembers(members || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchInvites = async () => {
    if (!user) return;

    try {
      // Convites recebidos
      const { data: received, error: receivedError } = await supabase
        .from('couple_invites')
        .select(`
          *,
          couple:couples(*),
          inviter:profiles!couple_invites_invited_by_fkey(*)
        `)
        .eq('invited_email', user.email)
        .eq('status', 'pending');

      if (receivedError) throw receivedError;
      setPendingInvites(received || []);

      // Convites enviados
      const { data: sent, error: sentError } = await supabase
        .from('couple_invites')
        .select(`
          *,
          couple:couples(*)
        `)
        .eq('invited_by', user.id);

      if (sentError) throw sentError;
      setSentInvites(sent || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createCouple = async (name: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data: coupleData, error: coupleError } = await supabase
        .from('couples')
        .insert([{
          name,
          created_by: user.id
        }])
        .select()
        .single();

      if (coupleError) throw coupleError;

      // Atualizar perfil com o ID do casal
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ couple_id: coupleData.id })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setCouple(coupleData);
      setProfile(prev => prev ? { ...prev, couple_id: coupleData.id } : null);
      setCoupleMembers([profile!]);

      return { data: coupleData, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const invitePartner = async (email: string) => {
    if (!user || !couple) throw new Error('Usuário não autenticado ou casal não encontrado');

    try {
      // Verificar se já existe um convite pendente
      const { data: existingInvite } = await supabase
        .from('couple_invites')
        .select('*')
        .eq('couple_id', couple.id)
        .eq('invited_email', email)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        throw new Error('Já existe um convite pendente para este email');
      }

      const { data, error } = await supabase
        .from('couple_invites')
        .insert([{
          couple_id: couple.id,
          invited_email: email,
          invited_by: user.id,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      setSentInvites(prev => [...prev, data]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const acceptInvite = async (inviteId: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const invite = pendingInvites.find(inv => inv.id === inviteId);
      if (!invite) throw new Error('Convite não encontrado');

      // Atualizar status do convite
      const { error: inviteError } = await supabase
        .from('couple_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      if (inviteError) throw inviteError;

      // Atualizar perfil com o ID do casal
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ couple_id: invite.couple_id })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setProfile(prev => prev ? { ...prev, couple_id: invite.couple_id } : null);
      setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));

      // Recarregar dados do casal
      await fetchCouple();

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const rejectInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('couple_invites')
        .update({ status: 'rejected' })
        .eq('id', inviteId);

      if (error) throw error;

      setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const leaveCouple = async () => {
    if (!user || !profile?.couple_id) throw new Error('Usuário não está em um casal');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ couple_id: null })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, couple_id: null } : null);
      setCouple(null);
      setCoupleMembers([]);

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const updateCoupleName = async (name: string) => {
    if (!couple) throw new Error('Casal não encontrado');

    try {
      const { data, error } = await supabase
        .from('couples')
        .update({ name })
        .eq('id', couple.id)
        .select()
        .single();

      if (error) throw error;

      setCouple(data);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      fetchCouple();
      fetchInvites();
    }
  }, [profile]);

  return {
    profile,
    couple,
    coupleMembers,
    pendingInvites,
    sentInvites,
    loading,
    error,
    createCouple,
    invitePartner,
    acceptInvite,
    rejectInvite,
    leaveCouple,
    updateCoupleName,
    refetch: () => {
      fetchProfile();
      fetchCouple();
      fetchInvites();
    }
  };
}