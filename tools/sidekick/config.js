window.hlx.initSidekick({
  project: 'Demo',
  hlx3: true,
  plugins: [
    {
      id: 'blocks',
      condition: (sk) => sk.isEditor() && (sk.location.search.includes('.docx&') || sk.location.search.includes('.md&')),
      button: {
        text: 'Blocks',
        action: (_, sk) => {
          console.log(sk);
        },
      },
    },
  ],
});
