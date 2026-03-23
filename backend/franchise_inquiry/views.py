from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import FranchiseInquiry
from .serializers import FranchiseInquirySerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def create_inquiry(request):
    """
    Handle franchise inquiry form submission.
    """
    serializer = FranchiseInquirySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Inquiry submitted successfully! Our team will contact you soon.',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'message': 'Submission failed. Please check your information.',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_inquiries(request):
    """
    List all franchise inquiries (admin only).
    """
    inquiries = FranchiseInquiry.objects.all()
    serializer = FranchiseInquirySerializer(inquiries, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def inquiry_detail(request, pk):
    """
    Retrieve, update or delete a franchise inquiry.
    """
    try:
        inquiry = FranchiseInquiry.objects.get(pk=pk)
    except FranchiseInquiry.DoesNotExist:
        return Response({'message': 'Inquiry not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = FranchiseInquirySerializer(inquiry)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = FranchiseInquirySerializer(inquiry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        inquiry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
