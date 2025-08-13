"""
Custom pagination classes
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination with custom response format
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'pagination': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'count': self.page.paginator.count,
                'page_size': self.page_size,
                'current_page': self.page.number,
                'total_pages': self.page.paginator.num_pages,
            },
            'results': data
        })


class LargePagination(StandardResultsSetPagination):
    """
    Large pagination for bulk operations
    """
    page_size = 50
    max_page_size = 200


class SmallPagination(StandardResultsSetPagination):
    """
    Small pagination for detailed views
    """
    page_size = 10
    max_page_size = 50
