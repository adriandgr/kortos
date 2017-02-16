function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

console.log('returns:', validateEmail('hey@some.com'));
console.log('returns:', validateEmail('h@some.co'));
console.log('returns:', validateEmail('heysome.com'));
console.log('returns:', validateEmail('hey@some.'));

