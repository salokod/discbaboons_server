const todaysDateFunc = () => {
  const date = new Date();
  const options = {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit',
  };
  const today = date.toLocaleDateString('en-CA', options);
  return today;
};

export default todaysDateFunc;
