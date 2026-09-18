export const meta = {
  model: "User",
  actions: ["find", "create", "update", "delete"],
  protectedFields: ["password"],
  allowGuestCreate: true,
  restricted: { delete: "ADMIN" },
};

const users = [
  { id: 1, name: "Alice", email: "alice@example.com", password: "secret" },
];

export async function find(args: { id?: string }) {
  if (args.id) return users.find((user) => user.id === Number(args.id)) ?? null;
  return users;
}

export async function create(args: { name?: string; email?: string; password?: string }) {
  const user = {
    id: users.length + 1,
    name: args.name ?? "Guest",
    email: args.email ?? "",
    password: args.password ?? "",
  };
  users.push(user);
  return user;
}

export async function update(args: { id?: string; name?: string; email?: string }) {
  const user = users.find((item) => item.id === Number(args.id));
  if (!user) throw new Error("User not found");
  if (args.name !== undefined) user.name = args.name;
  if (args.email !== undefined) user.email = args.email;
  return user;
}

export async function deleteUser(args: { id?: string }) {
  const index = users.findIndex((item) => item.id === Number(args.id));
  if (index === -1) throw new Error("User not found");
  return users.splice(index, 1)[0];
}
