const init = (element) => {

    const children = element.querySelectorAll(':scope > div');
    const background = children[0];

    background.classList.add('background');
    const bgHasImg = background.querySelector(':scope img');
    if (!bgHasImg) {
      const bgColor = background.textContent;
      element.style.background = bgColor;
      children[0].remove();
    }

    const container = children[1];
    container.classList.add('container');

    const ribbon = children[children.length - 1];
    ribbon.classList.add('ribbon');
    const bgImg = ribbon.querySelector(':scope img');
    if (!bgImg) {
        const bgColor = ribbon.textContent;
        ribbon.style = `background: ${bgColor}`;
        ribbon.innerHTML = '';
    }

};

export default init;
