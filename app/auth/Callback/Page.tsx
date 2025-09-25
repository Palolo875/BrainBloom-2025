'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

    useEffect(() => {
        const supabase = createClientComponentClient();
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                  if (session) {
                          // Redirige vers la page d'accueil après connexion
                                  router.push('/');
                                        }
                                            });

                                                return () => {
                                                      subscription.unsubscribe();
                                                          };
                                                            }, [router]);

                                                              return <p>Please wait, logging you in...</p>;
                                                              }
