const todaysDateFunc = () => {
  const date = new Date();
  const options = {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit',
  };
  return date.toLocaleDateString('en-CA', options);
};

export default todaysDateFunc;
