from typing import Dict, Any
from amazon_ec2_best_instance import Ec2BestInstance


class AmazonEc2BestInstanceService:
    """
    Service class for getting the best EC2 instance using Ec2BestInstance.
    """

    def get_best_instance(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get the best EC2 instance types based on the provided input data.

        Args:
            input_data (Dict[str, Any]): The input data containing 'options' and 'request'.

        Returns:
            Dict[str, Any]: The best EC2 instance types.
        """
        options = input_data.get('options', {})
        request = input_data.get('request')

        # Basic input validation
        if not isinstance(options, dict):
            raise ValueError("Options should be a dictionary.")
        if not request:
            raise ValueError("Request data is required.")

        ec2_best_instance = Ec2BestInstance(options)

        response = ec2_best_instance.get_best_instance_types(request)

        return response
