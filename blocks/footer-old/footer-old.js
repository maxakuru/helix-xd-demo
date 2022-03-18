const init = (element) => {

  const footer = document.querySelector('.footer.main');
  const footerLinks = [
    {
      label: 'Contact us',
      links: [
        {label: 'Request a demo', url: '#demo'},
        {label: 'Adobe.com', url: '#adobe'},
      ]
    },
    {
      label: 'Why Adobe FPO',
      links: [
        {label: 'Why partner with Adobe', url: '#'},
        {label: 'How we use our products', url: '#'},
        {label: 'Our partners', url: '#'},
        {label: 'Industry leadership', url: '#'},
        {label: 'Creative Cloud for Enterprise', url: '#'},
        {label: 'Document Cloud for Business', url: '#'},
      ]
    },
    {
      label: 'About Experience Cloud',
      links: [
        {label: 'Explore all products', url: '#'},
        {label: 'Adobe Experience Platform', url: '#'},
        {label: 'Adobe Analytics', url: '#'},
        {label: 'Adobe Experience Manager Sites (CMS)', url: '#'},
        {label: 'Adobe Experience Manager Assets (DAM)', url: '#'},
        {label: 'Marketo Engage', url: '#'},
        {label: 'Adobe Commerce', url: '#'},
      ]
    },
    {
      label: 'Our Solutions',
      links: [
        {label: 'Data insights & audiences', url: '#'},
        {label: 'Experience management platform', url: '#'},
        {label: 'Content management', url: '#'},
        {label: 'Commerce', url: '#'},
        {label: 'Customer journeys', url: '#'},
        {label: 'B2B marketing', url: '#'},
        {label: 'Digital enrollment & onboarding', url: '#'},
      ]
    },
    {
      label: 'Resources',
      links: [
        {label: 'Resource center', url: '#'},
        {label: 'Customer success stories', url: '#'},
        {label: 'Experience League (learn & support)', url: '#'},
        {label: 'Community forums', url: '#'},
        {label: 'Glossary', url: '#'},
        {label: 'Development resources', url: '#'},
      ]
    },
    // {
    //     label: 'Company',
    //     links: [
    //         {label: 'About Adobe', url: '#'},
    //         {label: 'Careers', url: '#'},
    //         {label: 'Newsroom', url: '#'},
    //         {label: 'Corporate responsibility', url: '#'},
    //         {label: 'Investor relations', url: '#'},
    //         {label: 'Supply chain', url: '#'},
    //         {label: 'Trust center', url: '#'},
    //         {label: 'Events', url: '#'},
    //         {label: 'Diversity & inclusion', url: '#'},
    //         {label: 'Integrity', url: '#'},
    //         {label: 'COVID-19', url: '#'},
    //     ]
    // },

  ];
  let footerHTML = '';
  footerLinks.forEach( function (section) {
    footerHTML += '<ul class="footer-group">'
    if (section.links.length) {
      footerHTML += '<li class="footer-section">'
      footerHTML += '<h2>' + section.label + '</h2>'
      footerHTML += '<ul class="footer-section-ul">'
      section.links.forEach( function (link){
        footerHTML += '<li><a href="' + link.url + '">' + link.label + '</a></li>'
      });
      footerHTML += '</ul></li>'
    }
    footerHTML += '</ul>'
  });
  if(footer)
    footer.innerHTML = footerHTML;
};

export default init;
