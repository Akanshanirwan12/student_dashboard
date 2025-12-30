const PORT = process.env.PORT;

if (!PORT) {
  throw new Error("PORT not found");
}

app.listen(PORT, () => {
  console.log("Server started on", PORT);
});
