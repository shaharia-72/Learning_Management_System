// import { create } from "zustand";
// import { mountStoreDevtool } from "simple-zustand-devtools";


// const useAuthStore = create((set, get) => ({

//     allUserData: null,
//     loading: false,

//     user: () => ({
//         user_id: get().allUserData?.user_id || null,
//         username: get().allUserData?.username || null,
//         user_unique_id: get().allUserData?.user_unique_id || null

//     }),

//     setUser: (user) =>
//         set({
//             allUserData: user,
//             loading: false
//         }),

//     setLoading: (loading) => set({ loading }),
//     isLoggedIn: () =>get().allUserData !==null,
// }));

// if (import.meta.env.Dev) {
//     mountStoreDevtool("Store",useAuthStore);
// }

// export { useAuthStore };


// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// const useAuthStore = create(
//     persist(
//         (set, get) => ({
//             allUserData: null,
//             loading: false,

//             get user() {
//                 return get().allUserData || { user_id: null, username: null, user_unique_id: null };
//             },

//             setUser: (user) => set({ allUserData: user, loading: false }),

//             setLoading: (loading) => set({ loading }),

//             get isLoggedIn() {
//                 return get().allUserData !== null;
//             },
//         }),
//         {
//             name: "auth-storage",
//         }
//     )
// );

// export { useAuthStore };


// src/store/auth.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      loading: true,
      
      // Simple boolean to check if user is logged in
      isLoggedIn: false,
      
      // Set user data and login status
      setUser: (userData) => set({ 
        user: userData, 
        isLoggedIn: userData !== null,
        loading: false 
      }),
      
      // Update loading state
      setLoading: (loading) => set({ loading }),
      
      // Clear auth state on logout
      clearAuth: () => set({ 
        user: null, 
        isLoggedIn: false,
        loading: false 
      })
    }),
    {
      name: "auth-storage", // Storage key
    }
  )
);