function renderPagination(currentPage, totalPages, search) {
    let paginationHtml = `<div class="flex gap-2 mt-4">`;

    if (currentPage > 1) {
        paginationHtml += `<a href="?page=${currentPage - 1}&search=${search}" class="px-3 py-1 bg-gray-200 rounded">Anterior</a>`;
    }

    for (let page = 1; page <= totalPages; page++) {
        const activeClass = (page === currentPage) ? 'bg-blue-500 text-white' : 'bg-gray-200';
        paginationHtml += `<a href="?page=${page}&search=${search}" class="px-3 py-1 ${activeClass} rounded">${page}</a>`;
    }

    if (currentPage < totalPages) {
        paginationHtml += `<a href="?page=${currentPage + 1}&search=${search}" class="px-3 py-1 bg-gray-200 rounded">Próximo</a>`;
    }

    paginationHtml += `</div>`;
    return paginationHtml;
}

module.exports = renderPagination; 