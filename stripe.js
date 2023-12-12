const stripe = require("stripe")(
  "sk_test_51OI36rSJcflJ2j0Nk6Fv2TCfM3JdVnr8P2YAN4pJYgToekmUVG5u5gYlpWjbOmXsoQY6keprXD13ErCdCz502phO00BVHYrynt"
);
(async () => {
  console.log("making req");
  const customer = await stripe.customers.create();
  console.log(customer);
})();
