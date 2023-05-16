from rest_framework.decorators import api_view
from rest_framework.response import Response
import boto3
from .service.amazon_ec2_best_instance_service import AmazonEc2BestInstanceService
import logging

logger = logging.getLogger(__name__)

ec2_service = AmazonEc2BestInstanceService()

def get_boolean_request_param(input_data, param_name):
    """Handle the validation and conversion of boolean request parameters."""
    param_value = input_data.get(param_name)
    if param_value is not None:
        if param_value not in ['all', 'true', 'false']:
            raise Exception(f"{param_value} is an invalid value for {param_name}")
        if param_value != 'all':
            return param_value == 'true'
    return None

@api_view(['POST'])
def instances(request):
    input_data = request.data

    best_instance_request = {
        'vcpu': input_data.get('vcpu'),
        'memory_gb': input_data.get('memoryGb'),
        'usage_class': input_data.get('usageClass'),
        'burstable': get_boolean_request_param(input_data, 'burstable'),
        'architecture': input_data.get('architecture'),
        #'product_descriptions': [input_data.get('productDescription')],
        'is_current_generation': get_boolean_request_param(input_data, 'currentGeneration'),
        'is_instance_storage_supported': get_boolean_request_param(input_data, 'instanceStorageSupported'),
        'is_best_price': True,
        'final_spot_price_determination_strategy': input_data.get('finalSpotPriceDeterminationStrategy'),
        'max_interruption_frequency': input_data.get('maxInterruptionFrequency'),
        'availability_zones': [description['value'] for description in input_data.get('availabilityZones')],
    }

    logger.info(best_instance_request)

    get_best_instance_input = {
        'options': {
            'region': input_data.get('region')
        },
        'request': best_instance_request
    }

    logger.info(get_best_instance_input)

    response = ec2_service.get_best_instance(get_best_instance_input)

    return Response({'instances': response})

def get_aws_regions():
    """Retrieve AWS regions."""
    ec2_client = boto3.client('ec2', region_name='us-east-1')
    response = ec2_client.describe_regions()
    return [region['RegionName'] for region in response['Regions']]

@api_view(['GET'])
def regions(request):
    """Handle the GET request for regions."""
    return Response({'regions': get_aws_regions()})

def get_availability_zones(region):
    """Retrieve AWS availability zones for a specific region."""
    ec2_client = boto3.client('ec2', region_name=region)
    response = ec2_client.describe_availability_zones()
    return [zone['ZoneName'] for zone in response['AvailabilityZones']]

@api_view(['GET'])
def availability_zones(request, region):
    """Handle the GET request for availability zones."""
    return Response({'availability_zones': get_availability_zones(region)})