jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
}));