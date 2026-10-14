CREATE OR ALTER PROCEDURE [dbo].[AdminPathsGetPaged]
    @SkipCount INT = 0,
    @MaxResultCount INT = 10,
    @Sorting NVARCHAR(100) = NULL,
    @Stage INT = NULL,
    @Day INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalPaths INT = (SELECT COUNT(1) FROM [dbo].[PathDay]);
    DECLARE @SevenDaysCount INT = (SELECT COUNT(1) FROM [dbo].[PathDay] WHERE [Stage] = 7);
    DECLARE @ThirtyDaysCount INT = (SELECT COUNT(1) FROM [dbo].[PathDay] WHERE [Stage] = 30);
    DECLARE @NinetyDaysCount INT = (SELECT COUNT(1) FROM [dbo].[PathDay] WHERE [Stage] = 90);

    DECLARE @SortField NVARCHAR(50) = N'stage';
    DECLARE @SortDir NVARCHAR(4) = N'ASC';

    IF (@Sorting IS NOT NULL AND LTRIM(RTRIM(@Sorting)) <> N'')
    BEGIN
        DECLARE @NormalizedSorting NVARCHAR(100) = LOWER(REPLACE(LTRIM(RTRIM(@Sorting)), N'entity.', N''));
        DECLARE @FirstToken NVARCHAR(100) = @NormalizedSorting;
        DECLARE @Comma INT = CHARINDEX(N',', @NormalizedSorting);

        IF (@Comma > 0)
            SET @FirstToken = LTRIM(RTRIM(LEFT(@NormalizedSorting, @Comma - 1)));

        DECLARE @SpaceIndex INT = CHARINDEX(N' ', @FirstToken);
        IF (@SpaceIndex > 0)
        BEGIN
            SET @SortField = LEFT(@FirstToken, @SpaceIndex - 1);
            SET @SortDir = CASE WHEN @FirstToken LIKE N'%desc' THEN N'DESC' ELSE N'ASC' END;
        END
        ELSE
        BEGIN
            SET @SortField = @FirstToken;
            SET @SortDir = N'ASC';
        END
    END

    IF (@SortField NOT IN (N'id', N'stage', N'day', N'feelingscount', N'challengescount', N'tipscount', N'creationtime'))
    BEGIN
        SET @SortField = N'stage';
        SET @SortDir = N'ASC';
    END

    IF (@SkipCount < 0) SET @SkipCount = 0;
    DECLARE @Take INT = CASE WHEN @MaxResultCount < 1 THEN 10 ELSE @MaxResultCount END;

    ;WITH Filtered AS
    (
        SELECT
            p.[Id],
            p.[Stage],
            p.[Day],
            p.[CreationTime],
            (SELECT COUNT(1) FROM [dbo].[PathEntry] e WHERE e.[PathDayId] = p.[Id] AND e.[Section] = 1) AS [FeelingsCount],
            (SELECT COUNT(1) FROM [dbo].[PathEntry] e WHERE e.[PathDayId] = p.[Id] AND e.[Section] = 2) AS [ChallengesCount],
            (SELECT COUNT(1) FROM [dbo].[PathEntry] e WHERE e.[PathDayId] = p.[Id] AND e.[Section] = 3) AS [TipsCount]
        FROM [dbo].[PathDay] p
        WHERE (@Stage IS NULL OR p.[Stage] = @Stage)
          AND (@Day IS NULL OR p.[Day] = @Day)
    ),
    Counted AS
    (
        SELECT f.*, COUNT(1) OVER() AS [TotalCount]
        FROM Filtered f
    )
    SELECT
        c.[Id],
        c.[Stage],
        c.[Day],
        c.[FeelingsCount],
        c.[ChallengesCount],
        c.[TipsCount],
        c.[CreationTime],
        c.[TotalCount],
        @TotalPaths AS [TotalPaths],
        @SevenDaysCount AS [SevenDaysCount],
        @ThirtyDaysCount AS [ThirtyDaysCount],
        @NinetyDaysCount AS [NinetyDaysCount]
    INTO #PathsPage
    FROM Counted c
    ORDER BY
        CASE WHEN @SortField = N'id' AND @SortDir = N'ASC' THEN c.[Id] END ASC,
        CASE WHEN @SortField = N'id' AND @SortDir = N'DESC' THEN c.[Id] END DESC,
        CASE WHEN @SortField = N'stage' AND @SortDir = N'ASC' THEN c.[Stage] END ASC,
        CASE WHEN @SortField = N'stage' AND @SortDir = N'DESC' THEN c.[Stage] END DESC,
        CASE WHEN @SortField = N'day' AND @SortDir = N'ASC' THEN c.[Day] END ASC,
        CASE WHEN @SortField = N'day' AND @SortDir = N'DESC' THEN c.[Day] END DESC,
        CASE WHEN @SortField = N'feelingscount' AND @SortDir = N'ASC' THEN c.[FeelingsCount] END ASC,
        CASE WHEN @SortField = N'feelingscount' AND @SortDir = N'DESC' THEN c.[FeelingsCount] END DESC,
        CASE WHEN @SortField = N'challengescount' AND @SortDir = N'ASC' THEN c.[ChallengesCount] END ASC,
        CASE WHEN @SortField = N'challengescount' AND @SortDir = N'DESC' THEN c.[ChallengesCount] END DESC,
        CASE WHEN @SortField = N'tipscount' AND @SortDir = N'ASC' THEN c.[TipsCount] END ASC,
        CASE WHEN @SortField = N'tipscount' AND @SortDir = N'DESC' THEN c.[TipsCount] END DESC,
        CASE WHEN @SortField = N'creationtime' AND @SortDir = N'ASC' THEN c.[CreationTime] END ASC,
        CASE WHEN @SortField = N'creationtime' AND @SortDir = N'DESC' THEN c.[CreationTime] END DESC,
        c.[Stage] ASC,
        c.[Day] ASC
    OFFSET @SkipCount ROWS FETCH NEXT @Take ROWS ONLY;

    IF EXISTS (SELECT 1 FROM #PathsPage)
    BEGIN
        SELECT
            [Id], [Stage], [Day], [FeelingsCount], [ChallengesCount], [TipsCount], [CreationTime],
            [TotalCount], [TotalPaths], [SevenDaysCount], [ThirtyDaysCount], [NinetyDaysCount]
        FROM #PathsPage;
    END
    ELSE
    BEGIN
        DECLARE @FilteredTotal INT =
        (
            SELECT COUNT(1)
            FROM [dbo].[PathDay] p
            WHERE (@Stage IS NULL OR p.[Stage] = @Stage)
              AND (@Day IS NULL OR p.[Day] = @Day)
        );

        SELECT
            CAST(0 AS BIGINT) AS [Id],
            CAST(0 AS INT) AS [Stage],
            CAST(0 AS INT) AS [Day],
            CAST(0 AS INT) AS [FeelingsCount],
            CAST(0 AS INT) AS [ChallengesCount],
            CAST(0 AS INT) AS [TipsCount],
            SYSUTCDATETIME() AS [CreationTime],
            @FilteredTotal AS [TotalCount],
            @TotalPaths AS [TotalPaths],
            @SevenDaysCount AS [SevenDaysCount],
            @ThirtyDaysCount AS [ThirtyDaysCount],
            @NinetyDaysCount AS [NinetyDaysCount];
    END
END
