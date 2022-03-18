const init = (element) => {
  const header = document.querySelector('.header');

  const container = element.querySelector(':scope > div');
  container.classList.add('container');
  const navContainer = element.querySelector(':scope > div > div');
  navContainer.classList.add('nav-container');
};

export default init;
