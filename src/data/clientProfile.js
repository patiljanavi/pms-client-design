/** The signed-in client and the accountant assigned to them. */
export const clientUser = {
  _id: "6877700101bec95e479eb001",
  firstName: "Grace",
  lastName: "Okafor",
  email: "grace@okaforholdings.com",
  initials: "GO",
  phone: "(555) 014-2290",
  account: {
    _id: "6877700101bec95e479eb101",
    name: "Okafor Holdings",
  },
}

export const assignedAccountant = {
  _id: "6877700101bec95e479eb201",
  name: "Ava Thompson",
  initials: "AT",
  role: "Senior accountant",
  email: "ava.thompson@harbor.example",
}

/** Shown on Register: who invited this client. */
export const invitation = {
  invitedBy: "Ava Thompson",
  accountName: "Okafor Holdings",
  email: "grace@okaforholdings.com",
  firstName: "Grace",
  lastName: "Okafor",
}
