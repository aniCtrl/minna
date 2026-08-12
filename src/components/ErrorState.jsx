function ErrorState({ message = "Something went wrong." }) {
  return (
    <div>
      <p>{message}</p>
    </div>
  );
}

export default ErrorState;