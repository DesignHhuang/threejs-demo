export const searchList = (() => {
  const result: any[] = [];
  for (let i = 0; i < 6; i++) {
    result.push({
      id: i,
      title: 'The inverter monitoring website is unable to connect to my inverter',
      content:
        '2020-11-14 11:20   Post by nd I cannot get the inverter data and cannot remotely monitor it. Please help me solve this problem.',
    });
  }
  return result;
})();

export const actions: any[] = [
  { icon: 'clarity:star-line', text: '156', color: '#018ffb' },
  { icon: 'bx:bxs-like', text: '156', color: '#459ae8' },
  { icon: 'bx:bxs-message-dots', text: '2', color: '#42d27d' },
];
