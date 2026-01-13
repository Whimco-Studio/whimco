import { User } from "@/types/admin";

export const mockAdminUser: User = {
  id: "1",
  email: "admin@whimco.com",
  name: "Whimco Admin",
  role: "admin",
  avatar: "/branding/Icon - White on Gradient.png",
  createdAt: "2023-01-01",
};

export const mockRegularUser: User = {
  id: "2",
  email: "creator@example.com",
  name: "Spotlight Creator",
  role: "user",
  avatar: "/branding/Icon - White on Gradient.png",
  createdAt: "2023-06-15",
};

// Change this to mockRegularUser to test user role view
export const mockCurrentUser: User = mockRegularUser;
