export default function Filter({ brands, onFilterChange }) {
  return (
    <div class="mb-6">
      <label for="brand-select" class="block mb-2 text-sm font-medium text-gray-300">Filtrar por marca:</label>
      <select id="brand-select" class="bg-gray-700 text-white p-2 rounded w-full" onChange={onFilterChange}>
        <option value="">Todas las marcas</option>
        {brands.map((brand) => (
          <option value={brand} key={brand}>{brand}</option>
        ))}
      </select>
    </div>
  );
}