from django.test import TestCase
from rest_framework.test import APIClient

from submissions import models


class SubmissionApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.broker_a = models.Broker.objects.create(
            name="Alpha Brokers",
            primary_contact_email="alpha@example.com",
        )
        self.broker_b = models.Broker.objects.create(
            name="Beta Brokers",
            primary_contact_email="beta@example.com",
        )

        self.company_alpha = models.Company.objects.create(
            legal_name="Alpha Manufacturing",
            industry="Industrial",
            headquarters_city="Chicago",
        )
        self.company_beta = models.Company.objects.create(
            legal_name="Beta Logistics",
            industry="Logistics",
            headquarters_city="Austin",
        )

        self.owner = models.TeamMember.objects.create(
            full_name="Casey Owner",
            email="casey.owner@example.com",
        )

        self.submission_a = models.Submission.objects.create(
            company=self.company_alpha,
            broker=self.broker_a,
            owner=self.owner,
            status=models.Submission.Status.NEW,
            priority=models.Submission.Priority.HIGH,
            summary="New opportunity from Alpha",
        )
        self.submission_b = models.Submission.objects.create(
            company=self.company_beta,
            broker=self.broker_b,
            owner=self.owner,
            status=models.Submission.Status.CLOSED,
            priority=models.Submission.Priority.LOW,
            summary="Closed opportunity from Beta",
        )

        models.Document.objects.create(
            submission=self.submission_a,
            title="Financial statements",
            doc_type="pdf",
            file_url="https://example.com/financials.pdf",
        )
        models.Note.objects.create(
            submission=self.submission_a,
            author_name="Reviewer One",
            body="Looks promising, continue review.",
        )
        models.Contact.objects.create(
            submission=self.submission_a,
            name="Jordan Contact",
            role="CFO",
            email="jordan@example.com",
            phone="555-0100",
        )

    def test_brokers_endpoint_returns_flat_list(self):
        response = self.client.get("/api/brokers/")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 2)
        self.assertIn("name", response.data[0])

    def test_submissions_list_filters_by_status(self):
        response = self.client.get("/api/submissions/?status=new")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.submission_a.id)

    def test_submissions_list_filters_by_broker_id(self):
        response = self.client.get(f"/api/submissions/?brokerId={self.broker_b.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.submission_b.id)

    def test_submissions_list_filters_by_company_search(self):
        response = self.client.get("/api/submissions/?companySearch=alpha")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.submission_a.id)

    def test_submissions_list_supports_has_documents_filter(self):
        response = self.client.get("/api/submissions/?hasDocuments=true")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.submission_a.id)

    def test_submission_detail_includes_related_sections(self):
        response = self.client.get(f"/api/submissions/{self.submission_a.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["contacts"]), 1)
        self.assertEqual(len(response.data["documents"]), 1)
        self.assertEqual(len(response.data["notes"]), 1)
