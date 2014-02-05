module.exports = {
  roles: {
    apps: [
      {name: 'test', roles: ['find','save','remove']}
    ],
    profiles: [
      {name: 'admin', permissions: ['test.find']}
    ]
  }
}