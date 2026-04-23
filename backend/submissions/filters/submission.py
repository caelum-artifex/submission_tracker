import django_filters

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    """Filter set for the submissions list endpoint.

    Supports status, brokerId, companySearch, date range (createdFrom/createdTo),
    and boolean presence filters (hasDocuments, hasNotes).
    Query param names are camelCase to match the camelCase JSON convention used
    by the rest of the API.
    """

    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    brokerId = django_filters.NumberFilter(field_name="broker_id")
    companySearch = django_filters.CharFilter(
        field_name="company__legal_name",
        lookup_expr="icontains",
    )
    createdFrom = django_filters.DateFilter(field_name="created_at", lookup_expr="date__gte")
    createdTo = django_filters.DateFilter(field_name="created_at", lookup_expr="date__lte")
    hasDocuments = django_filters.BooleanFilter(method="filter_has_documents")
    hasNotes = django_filters.BooleanFilter(method="filter_has_notes")

    class Meta:
        model = models.Submission
        fields = ["status"]

    def filter_has_documents(self, queryset, name, value):
        if value is True:
            return queryset.filter(documents__isnull=False).distinct()
        if value is False:
            return queryset.filter(documents__isnull=True)
        return queryset

    def filter_has_notes(self, queryset, name, value):
        if value is True:
            return queryset.filter(notes__isnull=False).distinct()
        if value is False:
            return queryset.filter(notes__isnull=True)
        return queryset

