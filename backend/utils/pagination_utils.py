def paginate_query(query, page, per_page):
    items = query.paginate(page=page, per_page=per_page, error_out=False)
    metadata = {
        "page": items.page,
        "per_page": items.per_page,
        "total_pages": items.pages,
        "total_items": items.total,
        "has_next": items.has_next,
        "has_prev": items.has_prev
    }
    return items.items, metadata
