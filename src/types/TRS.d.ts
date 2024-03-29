/* eslint-disable camelcase */
/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface external {
  'https://raw.githubusercontent.com/ga4gh-discovery/ga4gh-service-info/v1.0.0/service-info.yaml': {
    paths: {
      '/service-info': {
        get: external['https://raw.githubusercontent.com/ga4gh-discovery/ga4gh-service-info/v1.0.0/service-info.yaml']['operations']['getServiceInfo']
      }
    }
    components: {
      schemas: {
        /** GA4GH service */
        Service: {
          /** Unique ID of this service. Reverse domain name notation is recommended, though not required. The identifier should attempt to be globally unique so it can be used in downstream aggregator services e.g. Service Registry. */
          id: string
          /** Name of this service. Should be human readable. */
          name: string
          type: external['https://raw.githubusercontent.com/ga4gh-discovery/ga4gh-service-info/v1.0.0/service-info.yaml']['components']['schemas']['ServiceType']
          /** Description of the service. Should be human readable and provide information about the service. */
          description?: string
          /** Organization providing the service */
          organization: {
            /** Name of the organization responsible for the service */
            name: string
            /** URL of the website of the organization (RFC 3986 format) */
            url: string
          }
          /** URL of the contact for the provider of this service, e.g. a link to a contact form (RFC 3986 format), or an email (RFC 2368 format). */
          contactUrl?: string
          /** URL of the documentation of this service (RFC 3986 format). This should help someone learn how to use your service, including any specifics required to access data, e.g. authentication. */
          documentationUrl?: string
          /** Timestamp describing when the service was first deployed and available (RFC 3339 format) */
          createdAt?: string
          /** Timestamp describing when the service was last updated (RFC 3339 format) */
          updatedAt?: string
          /** Environment the service is running in. Use this to distinguish between production, development and testing/staging deployments. Suggested values are prod, test, dev, staging. However this is advised and not enforced. */
          environment?: string
          /** Version of the service being described. Semantic versioning is recommended, but other identifiers, such as dates or commit hashes, are also allowed. The version should be changed whenever the service is updated. */
          version: string
        }
        /** Type of a GA4GH service */
        ServiceType: {
          /** Namespace in reverse domain name format. Use `org.ga4gh` for implementations compliant with official GA4GH specifications. For services with custom APIs not standardized by GA4GH, or implementations diverging from official GA4GH specifications, use a different namespace (e.g. your organization's reverse domain name). */
          group: string
          /** Name of the API or GA4GH specification implemented. Official GA4GH types should be assigned as part of standards approval process. Custom artifacts are supported. */
          artifact: string
          /** Version of the API or specification. GA4GH specifications use semantic versioning. */
          version: string
        }
      }
    }
    operations: {
      getServiceInfo: {
        responses: {
          /** A successful operation to request the service information about this running service. */
          200: {
            content: {
              'application/json': external['https://raw.githubusercontent.com/ga4gh-discovery/ga4gh-service-info/v1.0.0/service-info.yaml']['components']['schemas']['Service']
            }
          }
        }
      }
    }
  }
}

export interface components {
  schemas: {
    Checksum: {
      /** The hex-string encoded checksum for the data. */
      checksum: string
      /**
       * The digest method used to create the checksum.
       * The value (e.g. `sha-256`) SHOULD be listed as `Hash Name String` in the https://github.com/ga4gh-discovery/ga4gh-checksum/blob/master/hash-alg.csv[GA4GH Checksum Hash Algorithm Registry].
       * Other values MAY be used, as long as implementors are aware of the issues discussed in https://tools.ietf.org/html/rfc6920#section-9.4[RFC6920].
       * GA4GH may provide more explicit guidance for use of non-IANA-registered algorithms in the future.
       */
      type: string
    }
    ToolFile: {
      /** Relative path of the file.  A descriptor's path can be used with the GA4GH .../{type}/descriptor/{relative_path} endpoint. */
      path?: string
      file_type?:
        | 'TEST_FILE'
        | 'PRIMARY_DESCRIPTOR'
        | 'SECONDARY_DESCRIPTOR'
        | 'CONTAINERFILE'
        | 'OTHER'
      checksum?: components['schemas']['Checksum']
    }
    /** Describes a class (type) of tool allowing us to categorize workflows, tasks, and maybe even other entities (such as services) separately. */
    ToolClass: {
      /** The unique identifier for the class. */
      id?: string
      /** A short friendly name for the class. */
      name?: string
      /** A longer explanation of what this class is and what it can accomplish. */
      description?: string
    }
    /** A tool (or described tool) is defined as a tuple of a descriptor file (which potentially consists of multiple files), a set of container images, and a set of instructions for creating those images. */
    Tool: {
      /** The URL for this tool in this registry. */
      url: string
      /** A unique identifier of the tool, scoped to this registry. */
      id: string
      /**
       * Support for this parameter is optional for tool registries that support aliases.
       * A list of strings that can be used to identify this tool which could be  straight up URLs.
       * This can be used to expose alternative ids (such as GUIDs) for a tool
       * for registries. Can be used to match tools across registries.
       */
      aliases?: string[]
      /** The organization that published the image. */
      organization: string
      /** The name of the tool. */
      name?: string
      toolclass: components['schemas']['ToolClass']
      /** The description of the tool. */
      description?: string
      /** The version of this tool in the registry. Iterates when fields like the description, author, etc. are updated. */
      meta_version?: string
      /** Whether this tool has a checker tool associated with it. */
      has_checker?: boolean
      /** Optional url to the checker tool that will exit successfully if this tool produced the expected result given test data. */
      checker_url?: string
      /** A list of versions for this tool. */
      versions: components['schemas']['ToolVersion'][]
    }
    /** A tool version describes a particular iteration of a tool as described by a reference to a specific image and/or documents. */
    ToolVersion: {
      /** Contact information for the author of this version of the tool in the registry. (More complex authorship information is handled by the descriptor). */
      author?: string[]
      /** The name of the version. */
      name?: string
      /** The URL for this tool version in this registry. */
      url: string
      /** An identifier of the version of this tool for this particular tool registry. */
      id: string
      /** This version of a tool is guaranteed to not change over time (for example, a  tool built from a tag in git as opposed to a branch). A production quality tool  is required to have a checksum */
      is_production?: boolean
      /** All known docker images (and versions/hashes) used by this tool. If the tool has to evaluate any of the docker images strings at runtime, those ones cannot be reported here. */
      images?: components['schemas']['ImageData'][]
      /** The type (or types) of descriptors available. */
      descriptor_type?: components['schemas']['DescriptorType'][]
      /** Reports if this tool has a containerfile available. (For Docker-based tools, this would indicate the presence of a Dockerfile) */
      containerfile?: boolean
      /** The version of this tool version in the registry. Iterates when fields like the description, author, etc. are updated. */
      meta_version?: string
      /** Reports whether this tool has been verified by a specific organization or individual. */
      verified?: boolean
      /** Source of metadata that can support a verified tool, such as an email or URL. */
      verified_source?: string[]
      /** Reports whether this version of the tool has been signed. */
      signed?: boolean
      /** An array of IDs for the applications that are stored inside this tool. */
      included_apps?: string[]
    }
    /** Describes one container image. */
    ImageData: {
      /** A docker registry or a URL to a Singularity registry. Used along with image_name to locate a specific image. */
      registry_host?: string
      /** Used in conjunction with a registry_url if provided to locate images. */
      image_name?: string
      /** Size of the container in bytes. */
      size?: number
      /** Last time the container was updated. */
      updated?: string
      /** A production (immutable) tool version is required to have a hashcode. Not required otherwise, but might be useful to detect changes.  This exposes the hashcode for specific image versions to verify that the container version pulled is actually the version that was indexed by the registry. */
      checksum?: components['schemas']['Checksum'][]
      image_type?: components['schemas']['ImageType']
    }
    /** Indicates what kind of container is this image is. */
    ImageType: 'Docker' | 'Singularity' | 'Conda'
    /** The type of descriptor that represents this version of the tool. Note that these files can also include associated Docker/container files  and test parameters that further describe a version of a tool. */
    DescriptorType: 'CWL' | 'WDL' | 'NFL' | 'GALAXY' | 'SMK'
    /** The output type of the descriptor. Plain types return the raw text while the "non-plain" types return the application/json */
    DescriptorTypeWithPlain:
      | 'CWL'
      | 'WDL'
      | 'NFL'
      | 'GALAXY'
      | 'PLAIN_CWL'
      | 'PLAIN_WDL'
      | 'PLAIN_NFL'
      | 'PLAIN_GALAXY'
      | 'PLAIN_SMK'
    /**
     * A file provides content for one of
     * - A tool descriptor is a metadata document that describes one or more tools.
     * - A tool document that describes how to test with one or more sample test
     * JSON.
     * - A containerfile is a document that describes how to build a particular
     * container image. Examples include Dockerfiles for creating Docker images
     * and Singularity recipes for Singularity images
     */
    FileWrapper: {
      /** The content of the file itself. One of url or content is required. */
      content?: string
      /** A production (immutable) tool version is required to have a hashcode. Not required otherwise, but might be useful to detect changes. */
      checksum?: components['schemas']['Checksum'][]
      /** Optional url to the underlying content, should include version information, and can include a git hash.  Note that this URL should resolve to the raw unwrapped content that would otherwise be available in content. One of url or content is required. */
      url?: string
    }
    Error: {
      code: number
      message?: string
    }
  }
  parameters: {
    /** An identifier of the tool version, scoped to this registry, for example `v1`. We recommend that versions use semantic versioning https://semver.org/spec/v2.0.0.html  (For example, `1.0.0` instead of `develop`) */
    version_id: string
    /** The output type of the descriptor. Plain types return the bare descriptor while the "non-plain" types return a descriptor wrapped with metadata. */
    type: components['schemas']['DescriptorTypeWithPlain']
    /** A unique identifier of the tool, scoped to this registry, for example `123456`. */
    id: string
    /** Amount of records to return in a given page. */
    limit: number
    /** Start index of paging. Pagination results can be based on numbers or other values chosen by the registry implementor (for example, SHA values). If this exceeds the current result set return an empty set.  If not specified in the request, this will start at the beginning of the results. */
    offset: string
  }
}

export interface operations {
  /** This endpoint returns one specific tool (which has ToolVersions nested inside it). */
  toolsIdGet: {
    parameters: {
      path: {
        /** A unique identifier of the tool, scoped to this registry, for example `123456`. */
        id: components['parameters']['id']
      }
    }
    responses: {
      /** A tool. */
      200: {
        content: {
          'application/json': components['schemas']['Tool']
          'text/plain': string
        }
      }
      /** The tool can not be found. */
      404: {
        content: {
          'application/json': components['schemas']['Error']
        }
      }
    }
  }
  /** Returns all versions of the specified tool. */
  toolsIdVersionsGet: {
    parameters: {
      path: {
        /** A unique identifier of the tool, scoped to this registry, for example `123456`. */
        id: components['parameters']['id']
      }
    }
    responses: {
      /** An array of tool versions. */
      200: {
        content: {
          'application/json': components['schemas']['ToolVersion'][]
        }
      }
    }
  }
  /** This endpoint returns one specific tool version. */
  toolsIdVersionsVersionIdGet: {
    parameters: {
      path: {
        /** A unique identifier of the tool, scoped to this registry, for example `123456`. */
        id: components['parameters']['id']
        /** An identifier of the tool version, scoped to this registry, for example `v1`. We recommend that versions use semantic versioning https://semver.org/spec/v2.0.0.html  (For example, `1.0.0` instead of `develop`) */
        version_id: components['parameters']['version_id']
      }
    }
    responses: {
      /** A tool version. */
      200: {
        content: {
          'application/json': components['schemas']['ToolVersion']
        }
      }
      /** The tool can not be found. */
      404: {
        content: {
          'application/json': components['schemas']['Error']
        }
      }
    }
  }
  /** This endpoint returns all tools available or a filtered subset using metadata query parameters. */
  toolsGet: {
    parameters: {
      query: {
        /** A unique identifier of the tool, scoped to this registry, for example `123456`. */
        id?: string
        /**
         * Support for this parameter is optional for tool registries that support aliases.
         * If provided will only return entries with the given alias.
         */
        alias?: string
        /** Filter tools by the name of the subclass (#/definitions/ToolClass) */
        toolClass?: string
        /** Filter tools by the name of the descriptor type */
        descriptorType?: components['schemas']['DescriptorType']
        /** The image registry that contains the image. */
        registry?: string
        /** The organization in the registry that published the image. */
        organization?: string
        /** The name of the image. */
        name?: string
        /** The name of the tool. */
        toolname?: string
        /** The description of the tool. */
        description?: string
        /** The author of the tool (TODO a thought occurs, are we assuming that the author of the CWL and the image are the same?). */
        author?: string
        /** Return only checker workflows. */
        checker?: boolean
        /** Start index of paging. Pagination results can be based on numbers or other values chosen by the registry implementor (for example, SHA values). If this exceeds the current result set return an empty set.  If not specified in the request, this will start at the beginning of the results. */
        offset?: components['parameters']['offset']
        /** Amount of records to return in a given page. */
        limit?: components['parameters']['limit']
      }
    }
    responses: {
      /** An array of Tools that match the filter. */
      200: {
        headers: {
          /** A URL that can be used to reach the next page based on the current offset and page record limit. */
          next_page?: string
          /** A URL that can be used to reach the last page based on the current page record limit. */
          last_page?: string
          /** A URL that can be used to return to the current page later. */
          self_link?: string
          /** The current start index of the paging used for this result. */
          current_offset?: string
          /** The current page record limit used for this result. */
          current_limit?: number
        }
        content: {
          'application/json': components['schemas']['Tool'][]
        }
      }
    }
  }
  /** Returns the descriptor for the specified tool (examples include CWL, WDL, Nextflow, Galaxy, or Snakemake documents). */
  toolsIdVersionsVersionIdTypeDescriptorGet: {
    parameters: {
      path: {
        /** A unique identifier of the tool, scoped to this registry, for example `123456`. */
        id: components['parameters']['id']
        /** The output type of the descriptor. Plain types return the bare descriptor while the "non-plain" types return a descriptor wrapped with metadata. */
        type: components['parameters']['type']
        /** An identifier of the tool version, scoped to this registry, for example `v1`. We recommend that versions use semantic versioning https://semver.org/spec/v2.0.0.html  (For example, `1.0.0` instead of `develop`) */
        version_id: components['parameters']['version_id']
      }
    }
    responses: {
      /** The tool descriptor. */
      200: {
        content: {
          'application/json': components['schemas']['FileWrapper']
          'text/plain': string
        }
      }
      /** The tool descriptor can not be found. */
      404: {
        content: {
          'application/json': components['schemas']['Error']
        }
      }
    }
  }
  /** Descriptors can often include imports that refer to additional descriptors. This returns additional descriptors for the specified tool in the same or other directories that can be reached as a relative path. This endpoint can be useful for workflow engine implementations like cwltool to programmatically download all the descriptors for a tool and run it. This can optionally include other files described with FileWrappers such as test parameters and containerfiles. */
  toolsIdVersionsVersionIdTypeDescriptorRelativePathGet: {
    parameters: {
      path: {
        /** A unique identifier of the tool, scoped to this registry, for example `123456`. */
        id: components['parameters']['id']
        /** The output type of the descriptor. Plain types return the bare descriptor while the "non-plain" types return a descriptor wrapped with metadata. */
        type: components['parameters']['type']
        /** An identifier of the tool version, scoped to this registry, for example `v1`. We recommend that versions use semantic versioning https://semver.org/spec/v2.0.0.html  (For example, `1.0.0` instead of `develop`) */
        version_id: components['parameters']['version_id']
        /** A relative path to the additional file (same directory or subdirectories), for example 'foo.cwl' would return a 'foo.cwl' from the same directory as the main descriptor. 'nestedDirectory/foo.cwl' would return the file  from a nested subdirectory.  Unencoded paths such 'sampleDirectory/foo.cwl' should also be allowed. */
        relative_path: string
      }
    }
    responses: {
      /** The tool descriptor. */
      200: {
        content: {
          'application/json': components['schemas']['FileWrapper']
          'text/plain': string
        }
      }
      /** The tool can not be output in the specified type. */
      404: {
        content: {
          'application/json': components['schemas']['Error']
        }
      }
    }
  }
  /** Get a list of test JSONs (these allow you to execute the tool successfully) suitable for use with this descriptor type. */
  toolsIdVersionsVersionIdTypeTestsGet: {
    parameters: {
      path: {
        /** A unique identifier of the tool, scoped to this registry, for example `123456`. */
        id: components['parameters']['id']
        /** The output type of the descriptor. Plain types return the bare descriptor while the "non-plain" types return a descriptor wrapped with metadata. */
        type: components['parameters']['type']
        /** An identifier of the tool version, scoped to this registry, for example `v1`. We recommend that versions use semantic versioning https://semver.org/spec/v2.0.0.html  (For example, `1.0.0` instead of `develop`) */
        version_id: components['parameters']['version_id']
      }
    }
    responses: {
      /** The tool test JSON response. */
      200: {
        content: {
          'application/json': components['schemas']['FileWrapper'][]
          'text/plain': components['schemas']['FileWrapper'][]
        }
      }
      /** The tool can not be output in the specified type. */
      404: {
        content: {
          'application/json': components['schemas']['Error']
        }
      }
    }
  }
  /** Get a list of objects that contain the relative path and file type. The descriptors are intended for use with the /tools/{id}/versions/{version_id}/{type}/descriptor/{relative_path} endpoint. Returns a zip file of all files when format=zip is specified. */
  toolsIdVersionsVersionIdTypeFilesGet: {
    parameters: {
      path: {
        /** A unique identifier of the tool, scoped to this registry, for example `123456`. */
        id: components['parameters']['id']
        /** The output type of the descriptor. */
        type: components['schemas']['DescriptorType']
        /** An identifier of the tool version, scoped to this registry, for example `v1`. We recommend that versions use semantic versioning https://semver.org/spec/v2.0.0.html  (For example, `1.0.0` instead of `develop`) */
        version_id: components['parameters']['version_id']
      }
      query: {
        /** Returns a zip file of all files when format=zip is specified. */
        format?: 'zip'
      }
    }
    responses: {
      /** The array of File JSON responses. */
      200: {
        content: {
          'application/json': components['schemas']['ToolFile'][]
          'application/zip': components['schemas']['ToolFile'][]
        }
      }
      /** The tool can not be output in the specified type. */
      404: {
        content: {
          'application/json': components['schemas']['Error']
        }
      }
    }
  }
  /** Returns the container specifications(s) for the specified image. For example, a CWL CommandlineTool can be associated with one specification for a container, a CWL Workflow can be associated with multiple specifications for containers. */
  toolsIdVersionsVersionIdContainerfileGet: {
    parameters: {
      path: {
        /** A unique identifier of the tool, scoped to this registry, for example `123456`. */
        id: components['parameters']['id']
        /** An identifier of the tool version, scoped to this registry, for example `v1`. We recommend that versions use semantic versioning https://semver.org/spec/v2.0.0.html  (For example, `1.0.0` instead of `develop`) */
        version_id: components['parameters']['version_id']
      }
    }
    responses: {
      /** The tool payload. */
      200: {
        content: {
          'application/json': components['schemas']['FileWrapper'][]
        }
      }
      /** There are no container specifications for this tool. */
      404: {
        content: {
          'application/json': components['schemas']['Error']
        }
      }
    }
  }
  /** This endpoint returns all tool-classes available. */
  toolClassesGet: {
    responses: {
      /** A list of potential tool classes. */
      200: {
        content: {
          'application/json': components['schemas']['ToolClass'][]
        }
      }
    }
  }
}

export interface paths {
  '/service-info': external['https://raw.githubusercontent.com/ga4gh-discovery/ga4gh-service-info/v1.0.0/service-info.yaml']['paths']['/service-info']
  '/tools/{id}': {
    /** This endpoint returns one specific tool (which has ToolVersions nested inside it). */
    get: operations['toolsIdGet']
  }
  '/tools/{id}/versions': {
    /** Returns all versions of the specified tool. */
    get: operations['toolsIdVersionsGet']
  }
  '/tools/{id}/versions/{version_id}': {
    /** This endpoint returns one specific tool version. */
    get: operations['toolsIdVersionsVersionIdGet']
  }
  '/tools': {
    /** This endpoint returns all tools available or a filtered subset using metadata query parameters. */
    get: operations['toolsGet']
  }
  '/tools/{id}/versions/{version_id}/{type}/descriptor': {
    /** Returns the descriptor for the specified tool (examples include CWL, WDL, Nextflow, Galaxy, or Snakemake documents). */
    get: operations['toolsIdVersionsVersionIdTypeDescriptorGet']
  }
  '/tools/{id}/versions/{version_id}/{type}/descriptor/{relative_path}': {
    /** Descriptors can often include imports that refer to additional descriptors. This returns additional descriptors for the specified tool in the same or other directories that can be reached as a relative path. This endpoint can be useful for workflow engine implementations like cwltool to programmatically download all the descriptors for a tool and run it. This can optionally include other files described with FileWrappers such as test parameters and containerfiles. */
    get: operations['toolsIdVersionsVersionIdTypeDescriptorRelativePathGet']
  }
  '/tools/{id}/versions/{version_id}/{type}/tests': {
    /** Get a list of test JSONs (these allow you to execute the tool successfully) suitable for use with this descriptor type. */
    get: operations['toolsIdVersionsVersionIdTypeTestsGet']
  }
  '/tools/{id}/versions/{version_id}/{type}/files': {
    /** Get a list of objects that contain the relative path and file type. The descriptors are intended for use with the /tools/{id}/versions/{version_id}/{type}/descriptor/{relative_path} endpoint. Returns a zip file of all files when format=zip is specified. */
    get: operations['toolsIdVersionsVersionIdTypeFilesGet']
  }
  '/tools/{id}/versions/{version_id}/containerfile': {
    /** Returns the container specifications(s) for the specified image. For example, a CWL CommandlineTool can be associated with one specification for a container, a CWL Workflow can be associated with multiple specifications for containers. */
    get: operations['toolsIdVersionsVersionIdContainerfileGet']
  }
  '/toolClasses': {
    /** This endpoint returns all tool-classes available. */
    get: operations['toolClassesGet']
  }
}
