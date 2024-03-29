/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/service-info': {
    /** May include information related (but not limited to) the workflow descriptor formats, versions supported, the WES API versions supported, and information about general service availability. */
    get: operations['GetServiceInfo']
  }
  '/runs': {
    /** This list should be provided in a stable ordering. (The actual ordering is implementation dependent.) When paging through the list, the client should not make assumptions about live updates, but should assume the contents of the list reflect the workflow list at the moment that the first page is requested.  To monitor a specific workflow run, use GetRunStatus or GetRunLog. */
    get: operations['ListRuns']
    /**
     * This endpoint creates a new workflow run and returns a `RunId` to monitor its progress.
     *
     * The `workflow_attachment` array may be used to upload files that are required to execute the workflow, including the primary workflow, tools imported by the workflow, other files referenced by the workflow, or files which are part of the input.  The implementation should stage these files to a temporary directory and execute the workflow from there. These parts must have a Content-Disposition header with a "filename" provided for each part.  Filenames may include subdirectories, but must not include references to parent directories with '..' -- implementations should guard against maliciously constructed filenames.
     *
     * The `workflow_url` is either an absolute URL to a workflow file that is accessible by the WES endpoint, or a relative URL corresponding to one of the files attached using `workflow_attachment`.
     *
     * The `workflow_params` JSON object specifies input parameters, such as input files.  The exact format of the JSON object depends on the conventions of the workflow language being used.  Input files should either be absolute URLs, or relative URLs corresponding to files uploaded using `workflow_attachment`.  The WES endpoint must understand and be able to access URLs supplied in the input.  This is implementation specific.
     *
     * The `workflow_type` is the type of workflow language and must be "CWL" or "WDL" currently (or another alternative  supported by this WES instance).
     *
     * The `workflow_type_version` is the version of the workflow language submitted and must be one supported by this WES instance.
     *
     * See the `RunRequest` documentation for details about other fields.
     */
    post: operations['RunWorkflow']
  }
  '/runs/{run_id}': {
    /** This endpoint provides detailed information about a given workflow run. The returned result has information about the outputs produced by this workflow (if available), a log object which allows the stderr and stdout to be retrieved, a log array so stderr/stdout for individual tasks can be retrieved, and the overall state of the workflow run (e.g. RUNNING, see the State section). */
    get: operations['GetRunLog']
  }
  '/runs/{run_id}/cancel': {
    post: operations['CancelRun']
  }
  '/runs/{run_id}/status': {
    /** This provides an abbreviated (and likely fast depending on implementation) status of the running workflow, returning a simple result with the  overall state of the workflow run (e.g. RUNNING, see the State section). */
    get: operations['GetRunStatus']
  }
}

export interface definitions {
  /** A message that allows one to describe default parameters for a workflow engine. */
  DefaultWorkflowEngineParameter: {
    /** The name of the parameter */
    name?: string
    /** Describes the type of the parameter, e.g. float. */
    type?: string
    /** The stringified version of the default parameter. e.g. "2.45". */
    default_value?: string
  }
  /** Log and other info */
  Log: {
    /** The task or workflow name */
    name?: string
    /** The command line that was executed */
    cmd?: string[]
    /** When the command started executing, in ISO 8601 format "%Y-%m-%dT%H:%M:%SZ" */
    start_time?: string
    /** When the command stopped executing (completed, failed, or cancelled), in ISO 8601 format "%Y-%m-%dT%H:%M:%SZ" */
    end_time?: string
    /** A URL to retrieve standard output logs of the workflow run or task.  This URL may change between status requests, or may not be available until the task or workflow has finished execution.  Should be available using the same credentials used to access the WES endpoint. */
    stdout?: string
    /** A URL to retrieve standard error logs of the workflow run or task.  This URL may change between status requests, or may not be available until the task or workflow has finished execution.  Should be available using the same credentials used to access the WES endpoint. */
    stderr?: string
    /** Exit code of the program */
    exit_code?: number
  }
  /** A message containing useful information about the running service, including supported versions and default settings. */
  ServiceInfo: {
    /** A map with keys as the workflow format type name (currently only CWL and WDL are used although a service may support others) and value is a workflow_type_version object which simply contains an array of one or more version strings */
    workflow_type_versions?: {
      [key: string]: definitions['WorkflowTypeVersion']
    }
    /** The version(s) of the WES schema supported by this service */
    supported_wes_versions?: string[]
    /** The filesystem protocols supported by this service, currently these may include common protocols using the terms 'http', 'https', 'sftp', 's3', 'gs', 'file', or 'synapse', but others  are possible and the terms beyond these core protocols are currently not fixed.   This section reports those protocols (either common or not) supported by this WES service. */
    supported_filesystem_protocols?: string[]
    /** The engine(s) used by this WES service, key is engine name (e.g. Cromwell) and value is version */
    workflow_engine_versions?: { [key: string]: string }
    /** Each workflow engine can present additional parameters that can be sent to the workflow engine. This message will list the default values, and their types for each workflow engine. */
    default_workflow_engine_parameters?: definitions['DefaultWorkflowEngineParameter'][]
    /** The system statistics, key is the statistic, value is the count of runs in that state. See the State enum for the possible keys. */
    system_state_counts?: { [key: string]: number }
    /** A web page URL with human-readable instructions on how to get an authorization token for use with a specific WES endpoint. */
    auth_instructions_url?: string
    /** An email address URL (mailto:) or web page URL with contact information for the operator of a specific WES endpoint.  Users of the endpoint should use this to report problems or security vulnerabilities. */
    contact_info_url?: string
    /** A key-value map of arbitrary, extended metadata outside the scope of the above but useful to report back */
    tags?: { [key: string]: string }
  }
  /**
   * - UNKNOWN: The state of the task is unknown. This provides a safe default for messages where this field is missing, for example, so that a missing field does not accidentally imply that the state is QUEUED.
   *
   *
   *  - QUEUED: The task is queued.
   *
   *
   * - INITIALIZING: The task has been assigned to a worker and is currently preparing to run. For example, the worker may be turning on, downloading input files, etc.
   *
   * - RUNNING: The task is running. Input files are downloaded and the first Executor has been started.
   *
   * - PAUSED: The task is paused. An implementation may have the ability to pause a task, but this is not required.
   *
   *
   *  - COMPLETE: The task has completed running. Executors have exited without error
   * and output files have been successfully uploaded.
   *
   *
   *  - EXECUTOR_ERROR: The task encountered an error in one of the Executor processes. Generally,
   * this means that an Executor exited with a non-zero exit code.
   *
   *
   *  - SYSTEM_ERROR: The task was stopped due to a system error, but not from an Executor,
   * for example an upload failed due to network issues, the worker's ran out of disk space, etc.
   *
   *
   *  - CANCELED: The task was canceled by the user.
   *
   *
   *   - CANCELING: The task was canceled by the user, and is in the process of stopping.
   */
  State:
    | 'UNKNOWN'
    | 'QUEUED'
    | 'INITIALIZING'
    | 'RUNNING'
    | 'PAUSED'
    | 'COMPLETE'
    | 'EXECUTOR_ERROR'
    | 'SYSTEM_ERROR'
    | 'CANCELED'
    | 'CANCELING'
  /** The service will return a RunListResponse when receiving a successful RunListRequest. */
  RunListResponse: {
    /** A list of workflow runs that the service has executed or is executing. The list is filtered to only include runs that the caller has permission to see. */
    runs?: definitions['RunStatus'][]
    /** A token which may be supplied as `page_token` in workflow run list request to get the next page of results.  An empty string indicates there are no more items to return. */
    next_page_token?: string
  }
  RunLog: {
    /** workflow run ID */
    run_id?: string
    /** The original request message used to initiate this execution. */
    request?: definitions['RunRequest']
    /** The state of the run e.g. RUNNING (see State) */
    state?: definitions['State']
    /** The logs, and other key info like timing and exit code, for the overall run of this workflow. */
    run_log?: definitions['Log']
    /** The logs, and other key info like timing and exit code, for each step in the workflow run. */
    task_logs?: definitions['Log'][]
    /** The outputs from the workflow run. */
    outputs?: { [key: string]: unknown }
  }
  /**
   * To execute a workflow, send a run request including all the details needed to begin downloading
   * and executing a given workflow.
   */
  RunRequest: {
    /**
     * REQUIRED
     * The workflow run parameterizations (JSON encoded), including input and output file locations
     */
    workflow_params?: { [key: string]: unknown }
    /**
     * REQUIRED
     * The workflow descriptor type, must be "CWL" or "WDL" currently (or another alternative supported by this WES instance)
     */
    workflow_type?: string
    /**
     * REQUIRED
     * The workflow descriptor type version, must be one supported by this WES instance
     */
    workflow_type_version?: string
    /**
     * OPTIONAL
     * A key-value map of arbitrary metadata outside the scope of `workflow_params` but useful to track with this run request
     */
    tags?: { [key: string]: string }
    /**
     * OPTIONAL
     * Additional parameters can be sent to the workflow engine using this field. Default values for these parameters can be obtained using the ServiceInfo endpoint.
     */
    workflow_engine_parameters?: { [key: string]: string }
    /**
     * REQUIRED
     * The workflow CWL or WDL document. When `workflow_attachments` is used to attach files, the `workflow_url` may be a relative path to one of the attachments.
     */
    workflow_url?: string
  }
  RunId: {
    /** workflow run ID */
    run_id?: string
  }
  /** Small description of a workflow run, returned by server during listing */
  RunStatus: {
    run_id: string
    state?: definitions['State']
  }
  /** Available workflow types supported by a given instance of the service. */
  WorkflowTypeVersion: {
    /** an array of one or more acceptable types for the `workflow_type` */
    workflow_type_version?: string[]
  }
  /** An object that can optionally include information about the error. */
  ErrorResponse: {
    /** A detailed error message. */
    msg?: string
    /** The integer representing the HTTP status code (e.g. 200, 404). */
    status_code?: number
  }
}

export interface operations {
  /** May include information related (but not limited to) the workflow descriptor formats, versions supported, the WES API versions supported, and information about general service availability. */
  GetServiceInfo: {
    responses: {
      200: {
        schema: definitions['ServiceInfo']
      }
      /** The request is malformed. */
      400: {
        schema: definitions['ErrorResponse']
      }
      /** The request is unauthorized. */
      401: {
        schema: definitions['ErrorResponse']
      }
      /** The requester is not authorized to perform this action. */
      403: {
        schema: definitions['ErrorResponse']
      }
      /** An unexpected error occurred. */
      500: {
        schema: definitions['ErrorResponse']
      }
    }
  }
  /** This list should be provided in a stable ordering. (The actual ordering is implementation dependent.) When paging through the list, the client should not make assumptions about live updates, but should assume the contents of the list reflect the workflow list at the moment that the first page is requested.  To monitor a specific workflow run, use GetRunStatus or GetRunLog. */
  ListRuns: {
    parameters: {
      query: {
        /** OPTIONAL The preferred number of workflow runs to return in a page. If not provided, the implementation should use a default page size. The implementation must not return more items than `page_size`, but it may return fewer.  Clients should not assume that if fewer than `page_size` items are returned that all items have been returned.  The availability of additional pages is indicated by the value of `next_page_token` in the response. */
        page_size?: number
        /** OPTIONAL Token to use to indicate where to start getting results. If unspecified, return the first page of results. */
        page_token?: string
      }
    }
    responses: {
      200: {
        schema: definitions['RunListResponse']
      }
      /** The request is malformed. */
      400: {
        schema: definitions['ErrorResponse']
      }
      /** The request is unauthorized. */
      401: {
        schema: definitions['ErrorResponse']
      }
      /** The requester is not authorized to perform this action. */
      403: {
        schema: definitions['ErrorResponse']
      }
      /** An unexpected error occurred. */
      500: {
        schema: definitions['ErrorResponse']
      }
    }
  }
  /**
   * This endpoint creates a new workflow run and returns a `RunId` to monitor its progress.
   *
   * The `workflow_attachment` array may be used to upload files that are required to execute the workflow, including the primary workflow, tools imported by the workflow, other files referenced by the workflow, or files which are part of the input.  The implementation should stage these files to a temporary directory and execute the workflow from there. These parts must have a Content-Disposition header with a "filename" provided for each part.  Filenames may include subdirectories, but must not include references to parent directories with '..' -- implementations should guard against maliciously constructed filenames.
   *
   * The `workflow_url` is either an absolute URL to a workflow file that is accessible by the WES endpoint, or a relative URL corresponding to one of the files attached using `workflow_attachment`.
   *
   * The `workflow_params` JSON object specifies input parameters, such as input files.  The exact format of the JSON object depends on the conventions of the workflow language being used.  Input files should either be absolute URLs, or relative URLs corresponding to files uploaded using `workflow_attachment`.  The WES endpoint must understand and be able to access URLs supplied in the input.  This is implementation specific.
   *
   * The `workflow_type` is the type of workflow language and must be "CWL" or "WDL" currently (or another alternative  supported by this WES instance).
   *
   * The `workflow_type_version` is the version of the workflow language submitted and must be one supported by this WES instance.
   *
   * See the `RunRequest` documentation for details about other fields.
   */
  RunWorkflow: {
    parameters: {
      formData: {
        workflow_params?: string
        workflow_type?: string
        workflow_type_version?: string
        tags?: string
        workflow_engine_parameters?: string
        workflow_url?: string
        workflow_attachment?: string[]
      }
    }
    responses: {
      200: {
        schema: definitions['RunId']
      }
      /** The request is malformed. */
      400: {
        schema: definitions['ErrorResponse']
      }
      /** The request is unauthorized. */
      401: {
        schema: definitions['ErrorResponse']
      }
      /** The requester is not authorized to perform this action. */
      403: {
        schema: definitions['ErrorResponse']
      }
      /** An unexpected error occurred. */
      500: {
        schema: definitions['ErrorResponse']
      }
    }
  }
  /** This endpoint provides detailed information about a given workflow run. The returned result has information about the outputs produced by this workflow (if available), a log object which allows the stderr and stdout to be retrieved, a log array so stderr/stdout for individual tasks can be retrieved, and the overall state of the workflow run (e.g. RUNNING, see the State section). */
  GetRunLog: {
    parameters: {
      path: {
        run_id: string
      }
    }
    responses: {
      200: {
        schema: definitions['RunLog']
      }
      /** The request is unauthorized. */
      401: {
        schema: definitions['ErrorResponse']
      }
      /** The requester is not authorized to perform this action. */
      403: {
        schema: definitions['ErrorResponse']
      }
      /** The requested workflow run not found. */
      404: {
        schema: definitions['ErrorResponse']
      }
      /** An unexpected error occurred. */
      500: {
        schema: definitions['ErrorResponse']
      }
    }
  }
  CancelRun: {
    parameters: {
      path: {
        run_id: string
      }
    }
    responses: {
      200: {
        schema: definitions['RunId']
      }
      /** The request is unauthorized. */
      401: {
        schema: definitions['ErrorResponse']
      }
      /** The requester is not authorized to perform this action. */
      403: {
        schema: definitions['ErrorResponse']
      }
      /** The requested workflow run wasn't found. */
      404: {
        schema: definitions['ErrorResponse']
      }
      /** An unexpected error occurred. */
      500: {
        schema: definitions['ErrorResponse']
      }
    }
  }
  /** This provides an abbreviated (and likely fast depending on implementation) status of the running workflow, returning a simple result with the  overall state of the workflow run (e.g. RUNNING, see the State section). */
  GetRunStatus: {
    parameters: {
      path: {
        run_id: string
      }
    }
    responses: {
      200: {
        schema: definitions['RunStatus']
      }
      /** The request is unauthorized. */
      401: {
        schema: definitions['ErrorResponse']
      }
      /** The requester is not authorized to perform this action. */
      403: {
        schema: definitions['ErrorResponse']
      }
      /** The requested workflow run wasn't found. */
      404: {
        schema: definitions['ErrorResponse']
      }
      /** An unexpected error occurred. */
      500: {
        schema: definitions['ErrorResponse']
      }
    }
  }
}
