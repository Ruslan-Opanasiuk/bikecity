function SignSelector({ signType, setSignType }) {
  return (
    <div className="mb-6">
      <select
        value={signType}
        onChange={(e) => setSignType(e.target.value)}
        className="p-2 border rounded w-64 text-left"
      >
        <option value="В1">Номер і напрямок веломаршруту</option>
        <option value="В2">Кінець веломаршруту</option>
        <option value="В3">Номер і напрямок веломаршруту</option>
        <option value="В4">Покажчик напрямків</option>
        <option value="В7">Схема веломаршруту</option>
        <option value="В8">Карта (схема) веломаршруту</option>
      </select>
    </div>
  );
}

export default SignSelector;
