/**
 * Dummy Supabase Client
 * This is a temporary placeholder to prevent compile errors
 * All functionality should be migrated to backend API
 */

const createDummySupabase = () => {
  const notImplemented = () => {
    console.warn("⚠️ Supabase is deprecated. Please use backend API instead.");
    return Promise.resolve({
      data: null,
      error: new Error("Not implemented - use backend API"),
    });
  };

  return {
    from: (table: string) => ({
      select: notImplemented,
      insert: notImplemented,
      update: notImplemented,
      delete: notImplemented,
      upsert: notImplemented,
      eq: function () {
        return this;
      },
      neq: function () {
        return this;
      },
      gt: function () {
        return this;
      },
      gte: function () {
        return this;
      },
      lt: function () {
        return this;
      },
      lte: function () {
        return this;
      },
      like: function () {
        return this;
      },
      ilike: function () {
        return this;
      },
      is: function () {
        return this;
      },
      in: function () {
        return this;
      },
      contains: function () {
        return this;
      },
      containedBy: function () {
        return this;
      },
      range: function () {
        return this;
      },
      match: function () {
        return this;
      },
      not: function () {
        return this;
      },
      or: function () {
        return this;
      },
      filter: function () {
        return this;
      },
      order: function () {
        return this;
      },
      limit: function () {
        return this;
      },
      single: notImplemented,
      maybeSingle: notImplemented,
    }),
    auth: {
      getUser: notImplemented,
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      }),
      signOut: notImplemented,
      signUp: notImplemented,
      signInWithPassword: notImplemented,
      updateUser: notImplemented,
    },
    channel: (name: string) => ({
      on: function () {
        return this;
      },
      subscribe: () => {},
    }),
    removeChannel: () => {},
    removeAllChannels: () => {},
    rpc: notImplemented,
  };
};

export const supabase = createDummySupabase();
