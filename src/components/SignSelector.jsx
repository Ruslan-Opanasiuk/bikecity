function SignSelector({ signType, setSignType }) {
  return (
    <div className="mb-6">
      <select
        value={signType}
        onChange={(e) => setSignType(e.target.value)}
        className="p-2 border rounded w-64 text-left"
      >
        <option value="B1">Номер і напрямок веломаршруту</option>
        <option value="B2">Кінець веломаршруту</option>
        <option value="B3">Номер і напрямок веломаршруту</option>
        <option value="B4">Покажчик напрямків</option>
        <option value="B7">Схема веломаршруту</option>
        {/* <option value="B8">Карта (схема) веломаршруту</option> */}
      </select>
    </div>
  );
}

export default SignSelector;