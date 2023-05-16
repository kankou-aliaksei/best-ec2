import React, {useState, useEffect} from 'react';
import Select from 'react-select';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import SelectMaterial from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {makeStyles} from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import {BASE_URL} from './constant';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    slider: {
        marginTop: theme.spacing(2),
    },
    table: {
        marginTop: theme.spacing(2),
    },
    typography: {
        color: 'rgba(0, 0, 0, 0.54)',
        padding: 0,
        fontSize: '12px',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 400,
        lineHeight: 1,
        letterSpacing: '0.00938em',

    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(63, 81, 181, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    errorOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(190,116,116,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    spinnerMessage: {
        color: 'white',
        fontSize: '1.5rem',
        marginLeft: '1rem',
    },
}));


function BestEc2Instance() {
    const productDescriptionsOptions = [
        'Linux/UNIX',
        'Red Hat Enterprise Linux',
        'SUSE Linux',
        'Windows',
        'Linux/UNIX (Amazon VPC)',
        'Red Hat Enterprise Linux (Amazon VPC)',
        'SUSE Linux (Amazon VPC)',
        'Windows (Amazon VPC)',
    ];

    const [errorMessage, setErrorMessage] = useState(null);
    const [instances, setInstances] = useState(null);
    const [formVisible, setFormVisible] = useState(true);
    const [vcpu, setVcpu] = useState('1');
    const [memoryGb, setMemoryGb] = useState('2');
    const [usageClass, setUsageClass] = useState('on-demand');
    const [burstable, setBurstable] = useState('all');
    const [architecture, setArchitecture] = useState('x86_64');
    const [productDescription, setProductDescription] = useState(productDescriptionsOptions[0]);
    const [currentGeneration, setCurrentGeneration] = useState('all');
    const [instanceStorageSupported, setInstanceStorageSupported] = useState(
        'all'
    );
    const [maxInterruptionFrequency, setMaxInterruptionFrequency] = useState(
        '10'
    );
    const [
        finalSpotPriceDeterminationStrategy,
        setFinalSpotPriceDeterminationStrategy,
    ] = useState('min');
    const [region, setRegion] = useState('us-east-1');
    const [regions, setRegions] = useState([]);
    const [availabilityZones, setAvailabilityZones] = useState([]);
    const [selectedZones, setSelectedZones] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [showAvailabilityZones, setShowAvailabilityZones] = useState(false);
    const [showMaxInterruptionFrequency, setShowMaxInterruptionFrequency] = useState(false);

    useEffect(() => {
        fetch(`${BASE_URL}/regions`)
            .then((response) => response.json())
            .then((data) => setRegions(data.regions))
            .catch((error) => console.error('Error:', error));
    }, []);

    useEffect(() => {
        fetch(`${BASE_URL}/availability_zones/${region}`)
            .then((response) => response.json())
            .then((data) => {
                const zones = data.availability_zones.map((zone) => ({
                    value: zone,
                    label: zone,
                }));
                setAvailabilityZones(zones);
                setSelectedZones(zones);
                setShowAvailabilityZones(usageClass === 'spot'); // Set showAvailabilityZones based on usageClass
                setShowMaxInterruptionFrequency(usageClass === 'spot')
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [region, usageClass]);

    const handleZoneChange = (selectedOptions) => {
        setSelectedZones(selectedOptions || []);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = {
            region,
            vcpu: parseInt(vcpu),
            memoryGb: parseInt(memoryGb),
            usageClass,
            burstable,
            architecture,
            productDescription,
            currentGeneration,
            instanceStorageSupported,
            maxInterruptionFrequency: parseInt(maxInterruptionFrequency),
            availabilityZones: selectedZones,
            finalSpotPriceDeterminationStrategy,
        };

        try {

            setIsLoading(true);
            const response = await fetch(`${BASE_URL}/instances`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Bad request, please check your input');
                } else if (response.status === 500) {
                    throw new Error('Internal server error, please try again later');
                } else {
                    throw new Error('Network response was not ok');
                }
            }

            const instancesResponse = await response.json();
            setIsLoading(false);
            setInstances(instancesResponse.instances);
            setFormVisible(false);


        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(error.stack);
            setIsLoading(false);
        } finally {

        }
    };

    const classes = useStyles();

    return (
        <>
            <div>
                <h2>Best EC2</h2>
                <p>Application (based on pypi <a
                    href="https://github.com/kankou-aliaksei/amazon-ec2-best-instance">amazon-ec2-best-instance</a>)
                    provides you with the capability to select the
                    most efficient and cost-effective EC2 instance type for both on-demand and spot usage. It also
                    offers a reduced rate of instance reclamation for spot instances.</p>
            </div>
            {formVisible ? (
                <form onSubmit={handleSubmit}>
                    <FormControl className={classes.formControl}
                                 title="Specify the AWS Region to deploy the resources in">
                        <Typography className={classes.typography} variant="body1" gutterBottom>
                            Region
                        </Typography>
                        <SelectMaterial
                            labelId="region-label"
                            id="region-select"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                        >
                            {regions.map((zone) => (
                                <MenuItem key={zone} value={zone}>
                                    {zone}
                                </MenuItem>
                            ))}
                        </SelectMaterial>
                    </FormControl>


                    <div>
                        <FormControl className={classes.formControl}
                                     title="Provides details about the vCPU configurations available for the selected instance type">
                            <Typography className={classes.typography} variant="body1" gutterBottom>
                                vCPU
                            </Typography>
                            <TextField
                                type="number"
                                value={vcpu}
                                onChange={(e) => setVcpu(e.target.value)}
                                inputProps={{
                                    style: {textAlign: 'center'},
                                    min: 1,
                                }}
                                required
                            />
                        </FormControl>
                    </div>

                    <div>
                        <FormControl className={classes.formControl}
                                     title="Provides information about the memory capacity of the instance type, measured in gigabytes (GiB)">
                            <Typography className={classes.typography} variant="body1" gutterBottom>
                                Memory (GiB)
                            </Typography>
                            <TextField
                                type="number"
                                value={memoryGb}
                                onChange={(e) => setMemoryGb(e.target.value)}
                                inputProps={{
                                    style: {textAlign: 'center'},
                                    min: 1,
                                }}
                                required
                            />
                        </FormControl>
                    </div>

                    <div>
                        <FormControl className={classes.formControl}
                                     title="Specify whether the instance type is available for Spot or On-Demand usage">
                            <Typography className={classes.typography} id="current-generation-label" gutterBottom>
                                Usage Class
                            </Typography>
                            <SelectMaterial
                                labelId="usage-class-label"
                                id="usage-class-select"
                                value={usageClass}
                                onChange={(e) => setUsageClass(e.target.value)}
                            >
                                <MenuItem value="on-demand">On-Demand</MenuItem>
                                <MenuItem value="spot">Spot</MenuItem>
                            </SelectMaterial>
                        </FormControl>
                    </div>

                    <div>
                        <FormControl className={classes.formControl}
                                     title="Specifies whether the instance type is classified as a burstable performance instance">

                            <Typography className={classes.typography} id="current-generation-label" gutterBottom>
                                Burstable
                            </Typography>
                            <SelectMaterial
                                labelId="burstable-label"
                                id="burstable-select"
                                value={burstable}
                                onChange={(e) => setBurstable(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="true">True</MenuItem>
                                <MenuItem value="false">False</MenuItem>
                            </SelectMaterial>
                        </FormControl>
                    </div>

                    <div>
                        <FormControl className={classes.formControl}
                                     title="Specify whether to use the latest generation of the instance type">
                            <Typography className={classes.typography} id="current-generation-label" gutterBottom>
                                Current generation
                            </Typography>
                            <SelectMaterial
                                labelId="current-generation-label"
                                id="current-generation-select"
                                value={currentGeneration}
                                onChange={(e) => setCurrentGeneration(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="true">True</MenuItem>
                                <MenuItem value="false">False</MenuItem>
                            </SelectMaterial>
                        </FormControl>
                    </div>


                    <div>
                        <FormControl className={classes.formControl}
                                     title="Enhance your setup with instance types featuring robust instance store support">
                            <Typography
                                className={classes.typography}
                                id="instance-storage-supported"
                                gutterBottom
                            >
                                Instance storage supported
                            </Typography>
                            <SelectMaterial
                                labelId="instance-storage-supported"
                                id="instance-storage-supported"
                                value={instanceStorageSupported}
                                onChange={(e) => setInstanceStorageSupported(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="true">True</MenuItem>
                                <MenuItem value="false">False</MenuItem>
                            </SelectMaterial>
                        </FormControl>
                    </div>


                    <div>
                        <FormControl className={classes.formControl}
                                     title="Supported Architectures for the Instance Type">

                            <Typography className={classes.typography} variant="body1" gutterBottom>
                                Architecture
                            </Typography>
                            <SelectMaterial
                                labelId="architecture-label"
                                id="architecture-select"
                                value={architecture}
                                onChange={(e) => setArchitecture(e.target.value)}
                            >
                                <MenuItem value="x86_64">x86_64</MenuItem>
                                <MenuItem value="i386">i386</MenuItem>
                                <MenuItem value="arm64">arm64</MenuItem>
                                <MenuItem value="x86_64_mac">x86_64_mac</MenuItem>
                            </SelectMaterial>
                        </FormControl>
                    </div>

                    <div>
                        <FormControl className={classes.formControl}
                                     title="The operating system to be used on the virtual machine">
                            <Typography className={classes.typography} id="max-interruption-frequency-slider"
                                        gutterBottom>
                                Product description
                            </Typography>
                            <SelectMaterial
                                labelId="max-interruption-frequency-slider"
                                id="product-descriptions-select"
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                            >
                                {productDescriptionsOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </SelectMaterial>
                        </FormControl>
                    </div>


                    <div>
                        {showAvailabilityZones && (
                            <FormControl className={classes.formControl}
                                         title="Specify the availability zones within the selected AWS Region">
                                <Typography className={classes.typography} id="max-interruption-frequency-slider"
                                            gutterBottom>
                                    Availability Zones
                                </Typography>
                                <Select
                                    isMulti
                                    options={availabilityZones}
                                    value={selectedZones}
                                    onChange={handleZoneChange}
                                />
                            </FormControl>
                        )}
                    </div>

                    <div>
                        {showMaxInterruptionFrequency && (
                            <FormControl className={classes.formControl}
                                         title="Maximum spot instance interruption frequency as a percentage. Note: If you specify >=21, the rate '>20%' will be applied. This option is only applicable when 'usage_class' is set to 'spot'">
                                <Typography className={classes.typography} id="max-interruption-frequency-slider"
                                            gutterBottom>
                                    Max Interruption Frequency (%)
                                </Typography>
                                <Slider
                                    className={classes.slider}
                                    value={maxInterruptionFrequency}
                                    onChange={(e, newValue) => setMaxInterruptionFrequency(newValue)}
                                    valueLabelDisplay="auto"
                                    min={5}
                                    max={100}
                                    step={5}
                                    aria-labelledby="max-interruption-frequency-slider"
                                />
                            </FormControl>
                        )}
                    </div>

                    <div>
                        {showMaxInterruptionFrequency && (
                            <FormControl className={classes.formControl}
                                         title="Spot price determination strategy: sort instances by 'min' for minimum price, 'max' for maximum price, or 'average' for average price across selected availability zones">

                                <Typography className={classes.typography} id="max-interruption-frequency-slider"
                                            gutterBottom>
                                    Final spot price determination strategy
                                </Typography>
                                <SelectMaterial
                                    labelId="architecture-label"
                                    id="architecture-select"
                                    value={finalSpotPriceDeterminationStrategy}
                                    onChange={(e) => setFinalSpotPriceDeterminationStrategy(e.target.value)}
                                >
                                    <MenuItem value="min">Min</MenuItem>
                                    <MenuItem value="max">Max</MenuItem>
                                    <MenuItem value="average">Average</MenuItem>
                                </SelectMaterial>
                            </FormControl>
                        )}
                    </div>


                    <div>
                        <Button variant="contained" color="primary" type="submit">
                            Submit
                        </Button>
                    </div>

                    <div>
                        {isLoading && (
                            <div className={classes.overlay}>
                                <CircularProgress color="#3f51b5"/>
                                <span className={classes.spinnerMessage}>Please wait, getting data can take up to 1 minute</span>
                            </div>
                        )}
                        {errorMessage && (
                            <div className={classes.errorOverlay}>
                                <span className={classes.spinnerMessage}>{errorMessage}</span>
                            </div>
                        )}
                    </div>
                </form>) : (
                <Button
                    variant="contained"
                    color="primary"
                    style={{marginTop: '20px'}}
                    onClick={() => setFormVisible(true)}
                    className={formVisible ? 'button-hidden' : 'button-visible'}
                >
                    Search Again
                </Button>
            )}

            {instances && (
                <div>
                    <h2>Instance Data:</h2>
                    <TableContainer className={classes.table}>
                        <Table>
                            {instances.length > 0 ? (
                                <>
                                    <TableHead>
                                        <TableRow>
                                            {Object.keys(instances[0]).map((key) => (
                                                <TableCell
                                                    key={key}
                                                    style={{
                                                        backgroundColor: '#f2f2f2',
                                                        fontWeight: 'bold'
                                                    }} // Added style for highlighting
                                                >
                                                    {key === "price" ? "price per hour ($)" : key}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {instances.map((instance, index) => (
                                            <TableRow key={index}>
                                                {Object.values(instance).map((value, i) => (
                                                    <TableCell key={i}>
                                                        {typeof value === 'object' ? JSON.stringify(value) : value}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </>
                            ) : (
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Data not found</TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                        </Table>
                    </TableContainer>
                </div>
            )}
        </>
    );
}

export default BestEc2Instance;
