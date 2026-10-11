using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Auditing;
using Volo.Abp.Domain.Entities.Auditing;

namespace Al7.Thabat.Surveys;

[Table("SurveyQuestions")]
[Serializable]
[DisableAuditing]
public class SurveyQuestion : AuditedEntity<long>
{
    public virtual string? TitleAr { get; set; }
    public virtual string? TitleEn { get; set; }
    public virtual int Sort { get; set; }
    public virtual ICollection<SurveyAnswer> Answers { get; set; } = new List<SurveyAnswer>();
}
